let con1;
let con2;
let con3;
let res1 = "Top Result";
let res2 = "2nd";
let res3 = "3rd";
let chart;
let num = 0;
let interval = 24;
let freezeIt = false;
let upper90 = false;

var videoSelect = document.querySelector('select#videoSource');

// Grab elements, create settings, etc.
const video = document.getElementById('video');

//only video, no audio
let constraints = {
  video: true
};

// Create a webcam capture
navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).catch(handleError);

//rerun getStream when selection changes
videoSelect.onchange = getStream;

//populate dropdowns with all available devices
function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    
    //create each camera in dropdown
    var option = document.createElement('option');
    //assign id values
    option.value = deviceInfo.deviceId;
    
    //add 'camera '
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
      videoSelect.appendChild(option);
    }
  }
}

//start the stream for selection
function getStream() {
  
  if (window.stream) {
    //stop any running streams
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  
  //reset constraints to selected value
  constraints = {
    video: {
      deviceId: {exact: videoSelect.value}
    }
  };
  
  //rerun the video stream with new value
  navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);


function gotStream(stream) {
  window.stream = stream; // make stream available to console
  video.srcObject = stream;
  video.play();
}

//error handling
function handleError(error) {
  console.log('Error: ', error);
}

// Initialize the Image Classifier method with MobileNet passing the video as the
// second argument and the getClassification function as the third
ml5.imageClassifier('MobileNet', video)
  .then(classifier => loop(classifier))

const loop = (classifier) => {
  classifier.classify()
    .then(results => {
      result.innerText = results[0].label;
      probability.innerText = results[0].confidence.toFixed(4);
      gotResults(results);
      loop(classifier) // Call again to create a loop
    })
}


// When the model is loaded
function modelLoaded() {
  //hide loading screen
  //document.getElementById("loadOverlay").style.display = "none";
  alert("loaded");
}


//chart gradient stuff
var bar_ctx = document.getElementById('canvas1').getContext('2d');
var green_gradient = bar_ctx.createLinearGradient(0, 0, 600, 0);
green_gradient.addColorStop(0, 'rgb(35, 136, 35)');
green_gradient.addColorStop(1, 'rgb(0,255,0)');
var yellow_gradient = bar_ctx.createLinearGradient(0, 0, 600, 0);
yellow_gradient.addColorStop(0, 'rgb(255, 191, 0)');
yellow_gradient.addColorStop(1, 'rgb(255,255,0)');
var red_gradient = bar_ctx.createLinearGradient(0, 0, 600, 0);
red_gradient.addColorStop(0, 'rgb(210, 34, 45)');
red_gradient.addColorStop(1, 'rgb(255,0,0)');

// Chart
$(document).ready(function() {
  //cameraSetup();
  
  var options = {
    legend: false,
    responsive: true,
    maintainAspectRatio: false,
    onClick: graphClickEvent,
    scales: {
      xAxes: [
        {
          gridLines: { 
            display: false,
            color: "#ffffff" },
          ticks: {
            beginAtZero: true,
            fontColor:'#ffffff',
            steps: 10,
            stepValue: 5,
            max: 100,
            min: 5
          }
        }
      ],
      yAxes: [
        {
          gridLines: { 
            display: false,
            color: "#ffffff" 
          },
          ticks: {
            fontColor: "#ffffff"
          }
        }
      ]
    }
  };
  chart = new Chart($("#canvas1"), {
    type: "horizontalBar",
    tooltipFillColor: "rgba(51, 51, 51, 0.55)",
    scaleFontColor: "#FFFFFF",
    data: {
      labels: [res1, res2, res3],
      datasets: [
        {
          data: [70, 20, 10],
          backgroundColor: [green_gradient, yellow_gradient, red_gradient],
          hoverBackgroundColor: ["#49A9EA", "#49A9EA", "#49A9EA"]
        }
      ]
    },
    options: options
  });
});

// End Chart

//called when you click on the bars in the graph
function graphClickEvent(e) {
  //clicked element
  var element = this.getElementAtEvent(e);
  console.log(element);
  //clicked label
  var currentLabel = element[0]._model.label;
  
  var wikipediaLink = "https://en.wikipedia.org/wiki/" + currentLabel;
  // changes only the color of the active object
  //this.active[0]._chart.config.data.datasets[0].backgroundColor = "red";

  if (element.length > 0) {
  
    freeze();
    Swal.fire({
      title: currentLabel, 
      html: "Read about it ➡ <a href='" + wikipediaLink + "' target='_blank' title='Wikipedia article for " + currentLabel +"'><img class='wikiLink' height='30px' src='WikipediaLogo.svg'/></a>",  
      confirmButtonText: "Back",
      preConfirm: () => {unfreeze()}
});

  }
}


//called when top one gets over 90%
//gets weird because it continuously calls it if it stays over 90
function topResultOver90() {
  
  upper90 = true;
  //top label
  var currentLabel = res1;
  
  var wikipediaLink = "https://en.wikipedia.org/wiki/" + currentLabel;
  // changes only the color of the active object
  //this.active[0]._chart.config.data.datasets[0].backgroundColor = "red";
  
    freeze();
    Swal.fire({
      title: currentLabel, 
      html: "<a href='" + wikipediaLink + "' target='_blank' title='Wikipedia article for " + currentLabel +"'><img class='wikiLink' height='30px' src='WikipediaLogo.svg'/></a>",  
      confirmButtonText: "Back",
      preConfirm: () => {unfreeze()}
});
}


function freeze(){
  freezeIt = true;
}

function unfreeze(){
  freezeIt = false;
  upper90 = false;
}



//updates values in chart
function updateChart() {
  if(upper90 == false){
  chart.data.labels = [res1, res2, res3];
  chart.data.datasets[0].data = [con1, con2, con3];
  chart.update();
  }
}


function gotResults(results, error) {
  if (error) {
    console.error("Something went dreadfully wrong!");
    console.error(error);
  } else if (upper90 == false){
    //change ready light
    document.getElementById("results").style.background = "green";
    document.getElementById("results").title = "mobilenet loaded successfully";
    document.getElementById("loadOverlay").style.display = "none";
    //top 3 labels
    res1 = results[0].label;
    res2 = results[1].label;
    res3 = results[2].label;

    res1 = res1.charAt(0).toUpperCase() + res1.slice(1);
    res2 = res2.charAt(0).toUpperCase() + res2.slice(1);
    res3 = res3.charAt(0).toUpperCase() + res3.slice(1);
    //only return stuff before first comma
    res1 = res1.split(",")[0];
    res2 = res2.split(",")[0];
    res3 = res3.split(",")[0];

    //top 3 scores
    con1 = results[0].confidence;
    con2 = results[1].confidence;
    con3 = results[2].confidence;

    //round scores to one decimal
    con1 = con1 * 100;
    con1 = Math.round(con1 * 10) / 10;
    con2 = con2 * 100;
    con2 = Math.round(con2 * 10) / 10;
    con3 = con3 * 100;
    con3 = Math.round(con3 * 10) / 10;

    //increment the number
    num++;

    //check if the top value is above 90%
    if (con1 >= 90) {
      topResultOver90();
    }

    //put new values in chart at a set interval
    if (num == 0 || num % interval == 0 && freezeIt == false) {
      updateChart();
    }

    //rerun the analyzer
    var rgb = getAverageRGB(document.getElementById('video'));
    document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
  }
}




//http://jsfiddle.net/xLF38/818/
//sets background to average hue in video
function getAverageRGB(imgEl) {
    
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }
    
    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    
    context.drawImage(imgEl, 0, 0);
    
    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert('x');
        return defaultRGB;
    }
    
    length = data.data.length;
    
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
    
}