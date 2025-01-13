# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.3.0
FROM ghcr.io/rails/devcontainer/images/ruby:$RUBY_VERSION

USER root
RUN apt-get update -qq && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*

USER vscode