pipeline {
  agent any
  environment {
    AAA_TOP_LEVEL_VAR = 'topLevel'
    AAA_SECRET_TEXT = credentials('secret-text')
  }
  stages {
    stage('stage 1') {
      steps {
        sh 'echo $AAA_TOP_LEVEL_VAR'
        sh 'env | sort'
      }
    }
    stage('stage 2') {
      environment {
        AAA_STAGE_LEVEL_VAR = 'stageLevel'
      }
      steps {
        sh 'echo $AAA_STAGE_LEVEL_VAR'
        sh 'env | sort'
      }
    }
    stage('stage 3') {
      steps {
        sh 'echo $AAA_STAGE_LEVEL_VAR'
        sh 'env | sort'
      }
    }
    stage('stage 5') {
      steps {
        sh 'echo $AAA_SECRET_TEXT'
        sh 'env | sort'
      }
    }
  }
}