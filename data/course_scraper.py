import bs4, requests, json, sys, re

filepath = "courses/"

# Accepts unformated prerequisite text and outputs a boolean expression
def cleanPrereqExp(exp) :
	print('cleanPrereqExp input:',exp)
	exp = re.sub('[pP]re[-]?[rR]eq(uisite)?[s]?[:;]', '', exp) 		# clear prereq label
	exp = re.sub('[:;].*', '', exp) 								# clear anything after another : or ;
	exp = re.sub('CR[^A-Z]','', exp)								# clear 'CR' (eg MATH1231)
	exp = re.sub('[oO][rR]','+', exp)								# or -> +
	exp = re.sub('[aA][nN][dD]','*', exp)							# and -> *
	exp = re.sub('[^\(\)\+\* A-Z0-9]','', exp)						# clear everything but (, ), +, *, space, cap letters, digits
	exp = re.sub('[A-Z](?![A-Z]*[0-9]{2})','', exp)					# clear cap letters that arent followed by 4 digits
	exp = re.sub('(?<![0-9])[0-9]{1,3}(?![0-9])','', exp)			# clear 1-3 digits numbers
	exp = re.sub('(?<![0-9])[0-9]{5,}(?![0-9])','', exp)			# clear >=5 digits numbers
	exp = re.sub('(?<![A-Z])[0-9]{4}','', exp)						# clear 4 digits numbers that dont have 4 letters before
	exp = re.sub(' ','', exp)										# clear spaces
	print('cleanPrereqExp output:',exp)
	return exp



# Read arguements
if len(sys.argv) != 2 :
	sys.exit("Expected 1 arguement: <course code>")

courseid = sys.argv[1]

res = requests.get('http://www.handbook.unsw.edu.au/undergraduate/courses/2019/' + courseid)

# Setup soup
soup = bs4.BeautifulSoup(res.text, 'lxml')

data = {}

# Find prereqs
prereqElements = soup.select('#readMoreSubjectConditions > div > div')
prereqsData = {}
prereqExp = ''
for prereqElement in prereqElements:
	print("Text in prereq label:", prereqElement.text)
	if re.match('[pP]re[-]?req(uisite)?[s]?:[ ]?', prereqElement.text):
		prereqExp = cleanPrereqExp(prereqElement.text)
		courses = re.findall(r'\b[A-Z]{4}[0-9]{4}\b', prereqElement.text)
		for course in courses:
			prereqsData[course] = True

data['pre-requisites'] = {prereqExp : prereqsData}


# Find term offerings
sideBoxePs = soup.select('.a-column-md-6 > .o-attributes-table-item > p')
termsData = {}
for sideBoxeP in sideBoxePs:
	terms = re.findall(r'\bTerm [0-3]\b', sideBoxeP.text)
	for term in terms:
		termNo = term[-1:]
		termsData[termNo] = True

data['terms'] = termsData

# Output data to file
json_data = json.dumps(data)
print("Data", json_data)
with open(filepath + courseid + '.json', 'w') as outfile:
    json.dump(data, outfile)


