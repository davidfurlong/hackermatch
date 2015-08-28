Meteor.startup(function() {
    if (Meteor.isClient) {
        return SEO.config({
            title: 'Hackermatch',
            meta: {
                'title': 'Hackermatch',
                'description': 'Find hackathon team mates by discussing ideas. For hackers, by hackers, with <3. Made in San Francisco',
                'keywords': 'hacker, hackermatch, match, hackathon, hackathonhackers, hacker tools, hacker dating, teams, teammates, hackathon teammates, hackathon ideas, skills, hacker match, HH, hackathon teammates'
                
            },
            og: {
                'image': 'http://hackermat.ch/logo.png',
                'title': 'Hackermatch',
                'type': 'website',
                'url': 'http://hackermat.ch',
                'description': 'Find hackathon team mates by discussing ideas. For hackers, by hackers, with <3. Made in San Francisco'
           }
        });
    }
});