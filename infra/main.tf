provider "aws" {
  region = "ap-southeast-1"
}

resource "aws_ecr_repository" "knowledge-management-core-api" {
  name = "knowledge-management-core-api"
}

resource "aws_ecs_cluster" "knowledge-management-cluster" {
  name = "knowledge-management-cluster"
}

resource "aws_ecs_task_definition" "knowledge-management-task" {
  family                   = "knowledge-management-task" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "knowledge-management-task",
      "image": "${aws_ecr_repository.knowledge-management-core-api.repository_url}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 512         # Specifying the memory our container requires
  cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_service" "knowledge-management-service" {
  name            = "knowledge-management-service"                        # Naming our first service
  cluster         = aws_ecs_cluster.knowledge-management-cluster.id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.knowledge-management-task.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 3 # Setting the number of containers we want deployed to 3

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
    container_name   = aws_ecs_task_definition.knowledge-management-task.family
    container_port   = 5000 # Specifying the container port
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = true                                                # Providing our containers with public IPs
    security_groups  = ["${aws_security_group.service_security_group.id}"] # Setting the security group
  }
}

# Providing a reference to our default VPC
resource "aws_default_vpc" "default_vpc" {
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "ap-southeast-1a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "ap-southeast-1b"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "ap-southeast-1c"
}


resource "aws_alb" "application_load_balancer" {
  name               = "test-lb-tf" # Naming our load balancer
  load_balancer_type = "application"
  subnets = [ # Referencing the default subnets
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}",
    "${aws_default_subnet.default_subnet_c.id}"
  ]
  # Referencing the security group
  security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
}

# Creating a security group for the load balancer:
resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 80 # Allowing traffic in from port 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

resource "aws_lb_target_group" "target_group" {
  name        = "target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # Referencing the default VPC

  health_check {
    healthy_threshold   = "2"
    unhealthy_threshold = "6"
    interval            = "30"
    matcher             = "200,301,302,304"
    path                = "/"
    protocol            = "HTTP"
    timeout             = "5"
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn # Referencing our load balancer
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our tagrte group
  }
}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}
