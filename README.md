# Cycle-analytics
This project provides both real-time and historical analysis of Barclays cycle stations (aka Borris bikes) within London.

The main structure is as follows:
* nodeApp - the NodeJS backend, which is split into 2 seperate node servers:
 * API for the front-end application
 * Task runner for the grabbing, storing & processing of cycle station data
* publicDataApp - the AngularJS frontend which acts as the MVC application

### Version
0.1 [WIP]

### Frameworks / Libraries used

Cycle Analytics makes use of multiple frameworks & libraries as shown below:

* [AngularJS] 
 * [chart.js] 
 * [ui.bootstrap]
 * [ngAnimate]
 * [angulartics]
* [Node.js] 
 * [express] 
 * [xml2js] 
 * [mongoose] 

### High level design

TBD
![HLD](http://cycleanalytics.io/assets/img/cycleanalytics.png)

### Installation

TBD

### Development

Want to contribute? Feel free to submit a pull request.

### Todo's

See the public Trello board here for the current tasks & bugs outstanding: https://trello.com/b/xgTHXbhR/cycleanalytics

### License

MIT Licence
