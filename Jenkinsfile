pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir('login-form') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t uttamm2407/townsquare-backend:v1 ./backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t uttamm2407/townsquare-frontend:v1 ./login-form'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    docker push uttamm2407/townsquare-backend:v1
                    docker push uttamm2407/townsquare-frontend:v1
                    '''
                }
            }
        }

    }
}
