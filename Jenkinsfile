pipeline {
  agent any

  environment {
    IMAGE = 'ghcr.io/sijma/military-portal-frontend'
    REPO = 'Sijma/military-portal-frontend'
    ASSET_NAME = 'frontend-dist.tar.gz'
  }

  stages {
    stage('Build') {
      agent {
        docker {
          image 'node:26-alpine'
          reuseNode true
          args '-v /var/lib/jenkins/cache/npm:/npm ' +
               '-e npm_config_cache=/npm -e HOME=/tmp'
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Publish image') {
      when { buildingTag() }
      steps {
        withCredentials([string(credentialsId: 'github-pet', variable: 'REG_TOKEN')]) {
          sh '''
            set -eu
            echo "$REG_TOKEN" | docker login ghcr.io -u sijma --password-stdin
            docker build -t "$IMAGE:$TAG_NAME" -t "$IMAGE:latest" .
            docker push "$IMAGE:$TAG_NAME"
            docker push "$IMAGE:latest"
          '''
        }
      }
    }

    stage('Publish release') {
      when { buildingTag() }
      steps {
        sh 'tar -czf "$ASSET_NAME" -C dist .'

        createGitHubRelease(
          credentialId: 'github-pet',
          repository: env.REPO,
          tag: env.TAG_NAME,
          commitish: env.GIT_COMMIT,
          name: "Release ${env.TAG_NAME}",
          bodyText: "Automated release build for ${env.TAG_NAME}."
        )

        uploadGithubReleaseAsset(
          credentialId: 'github-pet',
          repository: env.REPO,
          tagName: env.TAG_NAME,
          uploadAssets: [[filePath: "${env.ASSET_NAME}"]]
        )
      }
    }
  }

  post {
    always {
      sh 'docker logout ghcr.io || true'
    }
  }
}
