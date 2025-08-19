pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'ROLLBACK', defaultValue: false, description: 'Executar rollback em produção')
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Tag da imagem (deixe vazio para auto-tag)')
  }

  environment {
    REGISTRY = 'docker.io'
    APP_NAME = 'jenkins-pipeline-test'
    REGISTRY_NAMESPACE = 'wandersonalves'
    IMAGE = "${env.REGISTRY}/${env.REGISTRY_NAMESPACE}/${env.APP_NAME}"
  }

  stages {
    stage('Checkout') {
      when { expression { return !params.ROLLBACK } }
      steps {
        checkout scm
      }
    }

    stage('Build & Test') {
      when { expression { return !params.ROLLBACK } }
      steps {
        echo "Current Build Number: ${env.BUILD_NUMBER}"
      }
    }

    stage('Build & Push Image') {
      when { expression { return !params.ROLLBACK } }
      steps {
        script {
          def shortSha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.AUTO_TAG = "v${env.BUILD_NUMBER}-${shortSha}"
        }
        withCredentials([usernamePassword(credentialsId: 'REGISTRY_CREDS', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            echo "$REG_PASS" | docker login ${REGISTRY} -u "$REG_USER" --password-stdin
            docker build -t ${IMAGE}:${AUTO_TAG} -t ${IMAGE}:latest .
            docker push ${IMAGE}:${AUTO_TAG}
            docker push ${IMAGE}:latest
          """
        }
      }
    }

    stage('Deploy em Produção (Node contabo)') {
  agent { label 'contabo' }
  steps {
    script {
      def tag = params.ROLLBACK ? params.IMAGE_TAG?.trim() : (params.IMAGE_TAG?.trim() ?: env.AUTO_TAG)
      if (!tag) {
        error "Defina IMAGE_TAG para rollback ou deixe em branco no deploy normal."
      }
      withCredentials([usernamePassword(credentialsId: 'REGISTRY_CREDS', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
        sh '''
          set -e
          echo "Fazendo login no registry na VM de produção..."
          echo "$REG_PASS" | docker login $REGISTRY -u "$REG_USER" --password-stdin

          echo "Subindo $IMAGE:$tag..."
          docker pull wandersonalves/jenkins-pipeline-test:latest
          docker rm -f $APP_NAME || true
          docker run -d --name $APP_NAME -p 3000:3000 --restart=always wandersonalves/jenkins-pipeline-test:latest
        '''
      }
    }
  }
}

  }

  post {
    success { echo "Deploy ${params.ROLLBACK ? 'rollback' : 'release'} concluído." }
    failure { echo "Falha no deploy. Considere acionar rollback com uma tag estável." }
  }
}