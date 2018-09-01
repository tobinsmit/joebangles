import bs4, requests, json, sys

filepath = "degrees/"

# Read arguements
if len(sys.argv) != 2 :
	sys.exit("Expected 1 arguement: <specialisation>")

programid = sys.argv[1]
res = requests.get('http://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/' + programid)

# Setup soup
soup = bs4.BeautifulSoup(res.text, 'lxml')

data = {}

# Loop through cards
cards = soup.select('.m-accordion-body')
for card in cards:
	cardData = {}
	cardTitle = card.parent.parent.select_one('.m-accordion-group-header > div > h4').text
	print('\n',cardTitle)
	group = card.select_one('.o-course-list')
	courses = group.select('.m-single-course')
	for course in courses:
		courseCode = course.select_one('.m-single-course-top-row > span').text
		courseTitle = course.select_one('.m-single-course-bottom-row > p').text
		print(courseCode,  courseTitle)
		cardData[courseCode] = courseTitle
	data[cardTitle] = cardData

# Output data to file
json_data = json.dumps(data)

with open(programid + '.json', 'w') as outfile:
    json.dump(data, outfile)


