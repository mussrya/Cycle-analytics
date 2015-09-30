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

![HLD](http://cycleanalytics.io/assets/img/cycleanalytics.png)

### Installation

TBD

### Development

Want to contribute? Feel free to submit a pull request.

### Todo's

See the public Trello board here for the current tasks & bugs outstanding: https://trello.com/b/xgTHXbhR/cycleanalytics

### Additional links
* [Author's LinkedIn profile page](http://uk.linkedin.com/in/ryanmusselwhite/en) - shameless plug of my LinkedIn profile
* [Government public data API site](http://www.tfl.gov.uk/info-for/open-data-users/) - as well as the cycle data used within this platform there are many other types of data available
* [Official Barclays cycle hire page](https://web.barclayscyclehire.tfl.gov.uk/maps) - this page contains the official searching for docking stations with realtime information

### License

MIT Licence
