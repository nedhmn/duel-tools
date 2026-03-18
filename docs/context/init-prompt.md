hey. i have an empty repo. i need to map out maybe 2 web apps. but let's focus on the first one, 'duel prep'.

---

1. duel prep app

so for the 'duel prep' app, let's do frontend nextjs and backend python fastapi. i want the frontend hosted in vercel, backend hosted in railway. we'll also need a postgres database, also hosted in railway. we'll have a local docker postgres instance for development.

the way this app works is that the user inputs duelingbook replay urls, we support 3 different format of inputs, or modes:
1. 'regular' mode
2. 'tournament' mode
3. 'gfwl' mode

'regular' mode, users input a list of duelingbook replays. maybe 50 maximum. each replay is a match with multiple games. can be 1 to inf number of games per replay. what the app would do is:
1. it'll take list of duelingbook replay urls
2. send it to python backend to scrape/parse each url
3. return parsed, url-by-url, replay data to frontend
4. frontend has a view where it'll show 1 url at a time, all gsmes from that url. and users can toggle between url.

the view of each url is that in one replay/match, there are multiple games. these games have player1 and player2. the parsed data of the url will show the cards that each player seen, along with who went first, game number, and game winner. i want the view of one replay to be split into rows per games. eg. first row shows game 1 of the url. where each row has 2 columns where the left column is playerA's cards, and right column is playerB's cards. 

for more context, here's the scraper for the duelingbook urls: https://github.com/nedhmn/replay-scraper-api/blob/main/app/api/replays/scrape/services.py

it uses anti-captcha to get json of dueling logs.

here's the parser for the dueling logs: https://github.com/nedhmn/gfwl-data/blob/main/gfwldata/transformers/replay_parser.py

where the duelingbook log json is replay_data to the parse_replay method.

there's some irrelevant stuff in these examples that we wont need, eg. league_match_id, etc.

let's only focus on the 'regular' mode. the other modes, they do the same scraping/parsing but the format the users input the data and the views are different. 

---

2. saving/caching logs

after each scrape of replays, i want to store that in the postgres db so i wont have to scrape it again. ofc, this implies before scraping for each replay it'll check the db if i already have it.

i also want to ingest some initial data in the db. i have a list of replay urls i want scraped and sent to this db, although most of it is in an aws s3 bucket. we'll need separate scripts for this. it's a one-time script.

but the concept of saving/caching log is going to be across all replays scraped.

---

3. scraping db logs

i posted already the scraper from earlier, we'll use anti-captcha. but something else, it's actually very slow to scrape 1 url. i'd like to do this asynchronously. i need a good, scalable solution for this. and it has an error rate.

