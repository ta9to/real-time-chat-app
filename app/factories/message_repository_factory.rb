module MessageRepositoryFactory
  def self.build
    engine = ENV.fetch('MESSAGE_STORAGE_ENGINE', 'postgres').downcase
    case engine
    when 'dynamo'
      MessageRepositoryDynamo.new
    else
      MessageRepositoryPostgres.new
    end
  end
end
