if Rails.env.production?
  redis_url = "redis://#{ENV['REDIS_HOST']}:#{ENV['REDIS_PORT']}/0/session"

  Rails.application.config.session_store :redis_store,
    servers: [ redis_url ],
    expire_after: 90.minutes,
    key: '_my_app_session',
    threadsafe: false,
    secure: true
else
  Rails.application.config.session_store :cookie_store, key: '_my_app_session'
end
