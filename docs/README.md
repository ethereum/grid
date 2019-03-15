# Grid landing page

Our landing page is hosted by GitHub Pages, from `master` branch, `/docs` directory and can be accessed on https://grid.ethereum.org.

GitHub Pages uses Jekyll plugin (Ruby) to build html pages.

## 1. Add a GitHub access token to your environment

Depending on your shell, you need to add to `~/.bash_profile`, `~/.bashrc`, `~/.zshrc`.

[See detailed instructions](https://github.com/jekyll/github-metadata/blob/master/docs/authentication.md#1-jekyll_github_token).

```shell
# appending token information
echo "export JEKYLL_GITHUB_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> ~/.bash_profile

# reloading current shell
source ~/.bash_profile
```

## 2. Make sure you have a working Ruby environment.

```shell
# execute on your terminal
ruby -v
```

https://jekyllrb.com/docs/

Ruby `>2.2.5` is good, although it is recommended to use a version `>= 2.3`. If your current environment doesn't meet the criteria, please refer to the [installation guide](https://jekyllrb.com/docs/installation/).

## 3. Install required Ruby gems

```shell
cd docs/
gem install bundler jekyll
```

## 4. Run local server

```shell
bundle exec jekyll serve
```

You may also want to force-rebuild the site in case you get some stubborn cache.

```shell
bundle exec jekyll clean
bundle exec jekyll build
```

## Additional resources

- [Liquid](https://shopify.github.io/liquid/) (template engine used by Jekyll)
- [Jekyll documentation](https://jekyllrb.com/docs/)
- [GitHub Pages help](https://help.github.com/en/articles/configuring-a-publishing-source-for-github-pages?query=jekyll)
