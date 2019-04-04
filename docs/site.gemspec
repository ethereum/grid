$LOAD_PATH.unshift 'lib'
require "site/version"

Gem::Specification.new do |s|
  s.name              = "site"
  s.version           = Site::VERSION
  s.date              = Time.now.strftime('%Y-%m-%d')
  s.summary           = "Feed me."
  s.homepage          = "http://github.com/ethereum/grid"
  s.email             = "ev@ethereum.org"
  s.authors           = [ "Everton Fraga" ]
  s.has_rdoc          = false

  s.files             = %w( README.md Rakefile LICENSE )
  s.files            += Dir.glob("lib/**/*")
  s.files            += Dir.glob("bin/**/*")
  s.files            += Dir.glob("man/**/*")
  s.files            += Dir.glob("test/**/*")

#  s.executables       = %w( site )
  s.description       = <<desc
  Feed me.
desc
end
