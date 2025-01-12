# syntax = docker/dockerfile:1

ARG RUBY_VERSION=3.3
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS build

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      libvips \
      libsqlite3-dev \
      ca-certificates && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_WITHOUT="development test" \
    BUNDLE_PATH="/usr/local/bundle"

COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    bundle exec bootsnap precompile --gemfile

COPY . .

RUN bundle exec bootsnap precompile app/ lib/

RUN SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

FROM public.ecr.aws/lambda/ruby:3.3

WORKDIR /var/task

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_WITHOUT="development test" \
    BUNDLE_PATH="/usr/local/bundle"

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /var/task

CMD ["lambda_http.handler"]
