
function renderChart(){
    if(window.renderedChart != true){
        window.renderedChart = true;
        var ctx = document.getElementById("canvas").getContext("2d");
        window.myLine = new Chart(ctx).Line(window.lineChartData, {
            responsive: true,
            bezierCurveTension: 0.4,
            scaleShowGridLines : false,
            pointDot: false,
            // legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
            annotateDisplay: true,
            annotateLabel: '<%=v1%>',
            graphMin: 0,
            inGraphDataTmpl: '<%=v1%>',
            savePng: true,
            savePngBackgroundColor: 'white',
        });
        function legend(parent, data) {
            parent.className = 'legend';
            var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

            // remove possible children of the parent
            while(parent.hasChildNodes()) {
                parent.removeChild(parent.lastChild);
            }
            var label = document.createTextNode("Currently Working on");
            var h3 = document.createElement('h3');
            h3.appendChild(label);
            parent.appendChild(h3);
            datas.forEach(function(d) {
                var titlecontainer = document.createElement('div');
                var titlelabel = document.createElement('span');
                var title = document.createElement('span');
                title.className = 'title';
                titlelabel.className = 'title-dot';
                titlelabel.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
                // title.style.borderColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
                // title.style.borderStyle = 'solid';
                titlecontainer.appendChild(titlelabel);
                titlecontainer.appendChild(title);
                var link = document.createElement('a');
                link.href = d.url;
                title.appendChild(link)
                var text = document.createTextNode(d.label + " - "+d.bio);
                link.appendChild(text);
                parent.appendChild(titlecontainer);
            });
        }
        legend(document.getElementById("lineLegend"), window.lineChartData.datasets);
    }
}

/*
Template.hackathonList.helpers({
  hackathons: function() {
        var x = Hackathons.find({}).fetch();
        return x;
  }
});
*/
/*
Template.myHackathonList.helpers({
  hackathons: function() {
        var user = Meteor.user();
        if(!user) return;
        var hackathonList = [];
        _.each(user.roles, function(role, hackathon) {
            var entry = {};
            if(role == "admin") {
                console.log("admin role found");
            }
            console.log(role);
            console.log(hackathon);
            entry['url_title'] = hackathon;
            hackathonList.push(entry);
        });
        console.dir(hackathonList);
        var x = Hackathons.find({$or: hackathonList}).fetch();
        return x;
  }
});
*/                                                                                              