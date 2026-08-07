pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "uttamm2407"
        BACKEND_IMAGE = "uttamm2407/townsquare-backend:v2"
        FRONTEND_IMAGE = "uttamm2407/townsquare-frontend:v2"
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t $BACKEND_IMAGE .
                    '''
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('login-form') {
                    sh '''
                    docker build -t $FRONTEND_IMAGE .
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {

                    sh '''
                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

                    docker push $BACKEND_IMAGE
                    docker push $FRONTEND_IMAGE

                    docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f k8s/

                kubectl rollout restart deployment backend
                kubectl rollout restart deployment frontend

                kubectl rollout status deployment backend
                kubectl rollout status deployment frontend
                '''
            }
        }
    }

    post {
        success {
            echo "========================================="
            echo "TownSquare deployed successfully!"
            echo "Backend Image : $BACKEND_IMAGE"
            echo "Frontend Image: $FRONTEND_IMAGE"
            echo "========================================="
        }

        failure {
            echo "========================================="
            echo "Pipeline Failed!"
            echo "Check Jenkins Console Output."
            echo "========================================="
        }
    }
}
