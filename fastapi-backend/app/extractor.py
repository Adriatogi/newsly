from newspaper import Article

url = "https://stanforddaily.us1.list-manage.com/track/click?u=a6e6e96fbb8fbb96fc6af9c6f&id=851e25bf7f&e=b535775c0a"

article = Article(url)

article.download()
article.parse()

print(article.title)
print(article.authors)
print(article.text)
