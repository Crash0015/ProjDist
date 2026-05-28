FROM docker:27.3.1 AS dockercli

FROM jenkins/jenkins:lts
USER root
COPY --from=dockercli /usr/local/bin/docker /usr/local/bin/docker
USER jenkins
