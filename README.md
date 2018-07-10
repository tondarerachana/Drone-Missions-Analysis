## Overview

A mobile compatible web application to automate the process of  mission status checking of flying  drones which acts an interface for communication between the cloud and the drone.

### Background

Drones are opening up entirely new paradigms for commercial businesses. These flying robots are quickly stepping in to do jobs that are dull, dirty and dangerous. The age of robotics is here, and today is like Internet 1995.In many applications a drone can do a better job than a human, and one of those is infrastructure inspection. Being new technology, there are no standards in place and the results of these inspections can vary depending on the skill and experience of the drone operator.

### Specification

Commercial drone operators can contract the company and download pre-program inspection missions then visit the inspection site and fly the mission. After the mission is complete, the operator needs to send back data to mobile application to double check that the inspection is complete. The application needs a way to extract data from the images taken during the inspection and send it back to their cloud service for verification. The data that needs to be extracted from the pictures are standard EXIF data, XMP (DJI Metadata) and a thumbnail of each image.
For more information, please refer [Project Proposal](#initial-project-proposal-and-release-planning) 

## Authors

* **Gaurav Gandhi**
* **Rachana Tondare**
* **Siddhesh Salgaonkar**
* **Taashi Priya Khurana**

## Demo
* [Live Application](http://ec2-34-239-183-215.compute-1.amazonaws.com:5000)
* [Video](https://youtu.be/Od2zie95-wU) 

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

Node, NPM and AWS Account for setting up the required services.

* [Node Installation](https://github.com/nodejs/node/wiki/Installation)
* [AWS Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

### AWS Setup

* Cognito
    * [Setup user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
    * [Attach an app](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-configuring-app-integration.html)
    * Create an Identity Pool using above generated User Pool ID and App client ID with Cognito as the Authentication provider.
    * Above step creates two roles -
        * Cognito_<IDENTITY_POOL_NAME>Auth_Role (More on this later)
        * Cognito_<IDENTITY_POOL_NAME>Unauth_Role
    * Create a user from cognito console. The initial status will be 'FORCE_CHANGE_PASSWORD'.
    * Keep note of the User Pool ID, App Client ID, Identity Pool ID Identity provider string.
  
* S3 
    * Create a private bucket with name as 'drone-mission-plans'.
    * Each of the objects inside it correspond to a user indicated by a directory and its contents being the alloted mission plans.
    * Name of the object should be user's identity pool id (More on it later)

* IAM 
    * Attach following policy to the role - Cognito_<IDENTITY_POOL_NAME>Auth_Role.
    [More info](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html)
    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "mobileanalytics:PutEvents",
                    "cognito-sync:*",
                    "cognito-identity:*"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Action": [
                    "s3:ListBucket"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::drone-mission-plans"
                ],
                "Condition": {
                    "StringLike": {
                        "s3:prefix": [
                            "${cognito-identity.amazonaws.com:sub}/*"
                        ]
                    }
                }
            },
            {
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::drone-mission-plans/${cognito-identity.amazonaws.com:sub}",
                    "arn:aws:s3:::drone-mission-plans/${cognito-identity.amazonaws.com:sub}/*"
                ]
            }
        ]
    }
    ```
    This restricts the cognito user to a particular bucket object indicated by its identity pool id.
     
### Installation

#### Environment Variables
Make sure you have following environment variables set before you build/run the application.
```
DMA_APP_SECRET={App secret for expression session: String}
DMA_APP_SERVER_PORT={Port number for the application to run on: Number}
DMA_COOKIE_MAX_AGE={cookie max age in milliseconds: Number}
NODE_ENV={environment either 'DEV' or 'PROD': String}
DMA_APP_COGNITO_APP_CLIENT_ID={App client ID from Cognito}
DMA_APP_COGNITO_IDENTITY_POOL_ID={Identity Pool ID from Cognito}
DMA_APP_COGNITO_IDENTITY_PROVIDER={Identity Provider from Cognito}
DMA_APP_COGNITO_POOL_ID={User Pool ID from Cognito}
DMA_APP_COGNITO_REGION={Region for Cognito: String}
```

Assuming you have cloned the repository to your local machine and have all the required environment variables set.
From 'Drone-Mission-Analysis' (we'll call it 'root' from now onwards) folder, run following commands.

```
npm install
```

after completion run following command to start the server:
```
node server.js
```
to stop the running server press Ctrl + C:

Process Managers like PM2, Nodemon, Forever etc can also be used.

### Caveat
*  First time when user logs in, callback for 'NEW PASSWORD REQUIRED' is triggered owing to the inital status as 'FORCE_CHANGE_PASSWORD'
*  To change the user's status to 'CONFIRMED', it is mandatory to call  ```/login``` endpoint with something like below sample data:
  ```
  {
    "username": "foo_bar",
    "password": "Foobar@12345",
    "name": "Foo Bar",
    "newPassword": "Foobar@1234"
  }
  ```
* After this, user's status is confirmed. Login can proceed normally.
* Also, after first login (specifically after hitting the plan download endpoint) - Identity Pool ID is created for the user.
* It can be accessed from the Identity Browser tab of Cognito console.
* To store plans per user, create an object under the bucket 'drone-mission-plans' with name exactly as the above Identity Pool ID.
* Place user specific plans inside it.
* The idea is to have a separate object for the users with Identity Pool ID as the identifier.
    
## Project Structure

* Drone-Mission-Analysis
    * public - frontend scripts, html
        * app 
            * {entity/utility} - with files like services, controllers and templates
            * app.config.js - config file for angularjs app
            * app.directive.js - directives for the app
            * app.module.js - module definition
        * assets - static content
        * index.html - main html view
    * src - all the source code for the project.
        * {entity/utility}
            * router.js - route specification
            * service - route handlers, backend logic
        * config
            * common.js - config file for the application
            * local.js - local config
            * prod.js - production specific config
        * index.js - triggered by ../server.js. Instantites a server.
    * test - all the test files and mock data
    * .babelrc - babel config file for es6.
    * .gitignore - git ignore config for the project.
    * package.json - Specifies package dependency, npm config, metadata for the project.
    * README.md - Contains description about the project.
    * server.js - the main runner script.
    

## Initial Project Proposal and Release Planning
### 1.  Vision and Goals

To automate the process of  mission status checking of  flying  drones. Create a mobile based application to be an interface for communication between the Cloud and the drone. 


### 2.  Users/Personas

The end user of this project would be commercial drone operators or employees authorized to handle drones. The role of the end user is to download the mission plan from the mobile application and transfer it to the drone. Also to  monitor the drone while it completes the mission and transfer the images captured by the drone while on mission to the mobile from the SD card. And to upload the images to the mobile app for further processing. Once the processing is complete to download a new set of instructions for the drone.


### 3.   Scope and Features 

#### Mobile Application
 
 - Provides a simple, low bandwidth supported yet compelling web-based interface for end-users (Drone Operators).
 - Authentication mechanism to access the system (to download mission plans, upload drone downloaded images to check whether mission is complete or not)
 - Allows authenticated users to download their mission plans.
 - Extract metadata like XMP, EXIF and Thumbnails from the drone-taken images for analysis.
 - Upload the meta data for validation against the mission plan (client-side processing)
 - Provide a result as either ‘Mission Complete’ or 'Mission Fail' with a visualization using Google Maps.

#### What will not be covered

Drone related operations like:
 - Creation of mission plan.
 - Uploading of mission plan from mobile to the drone.
 - Downloading of images from the drone to the mobile device.


### 4. Solution Concept

#### Amazon EC2
Amazon elastic cloud service will be used to host the mobile application. It will act as an interface for communication between the user and the cloud services like Cognito, S3.

#### Amazon Cognito 
To authenticate users accessing the cloud service. A token generated for the authenticated users will be passed via subsequent requests to the various cloud services.

#### Amazon S3
To store the mission plans. S3 will act as an object base store for the mission plans. 

#### Web-Based Application  
The mobile app is built using NodeJS, AngularJS and  npm modules are used for image metadata extraction and processing.  

#### Proposed Architecture
![Global Architectural Structure Of the Project:](https://github.com/BU-NU-CLOUD-SP18/Drone-Mission-Analysis/blob/master/public/assets/images/DMA-Architecture-final.png)

### 5. Design Implications and Discussion

#### Amazon Web Services
Provides us with all the web services we need for creating this application which includes storage, authentication and computation. This service is prefered by the client. Allows us to be extensible, scalable and maintainable.

#### Amazon EC2
This service will act as a server to host the mobile application. Provides us with different options to scale up/down various resources as per our needs.

#### Amazon Cognito
Since only the authorized user should be able to access the mission plans, we need amazon’s cognito service for authentication. This service provides us with a sophisticated authentication mechanism using JWT(JSON web tokens). This service will also allow us to create user roles so as to segregate various features of the application amongst them.

#### Amazon S3
Low cost object based storage of mission plans which will be in csv format. Can segregate user specific access to the files if required by the application in future. Integrates well with other AWS technologies.

### 6. Acceptance criteria

 - The mobile device gets a mission plan from the cloud
 - After the mission is flown the application reads the image data from the SD card
 - The mobile devices uploads the images and the metadata is calcuated
 - The metadata is compared with the mission plan and the difference between the metadata and the mission plan is calculated
 - The mobile application will display the status of the mission after the analysis is complete
 -Pictorial visualisation using Google Maps

### 7.  Release Planning

Incremental feature progression of the project.

#### Iteration 1 
	1) Gathering the requirements
	2) Deciding the technologies to be used
	3) Project proposal documentation
	4) Role assignment
	5) Learning curves for Image processing and metadata understanding  and AWS technology
	
#### Iteration 2
	1) Researching efficient ways of extracting image metadata
	2) Setting up the AWS backend services
	3) Brainstorming comparison algorithm.
	4) Learning curves for Image processing and metadata understanding  and AWS technology

    Deliverables:
	1) UI mock-ups for the mobile application
	2) Application architecture

#### Iteration 3
	1) Pseudo code for the comparison algorithm
	2) Create UI for the application
	3) Integrate login functionality into the mobile application.

    Deliverables:
	1) UI wireframes for mobile application in
	2) Extracting data from the image using npm module
	3) Login functionality

#### Iteration 4
	1) Implementing the comparison algorithm
	2) Integration Testing

    Deliverables:
	1) Plan download functionality
	2) Multiple Image upload functionality
	
#### Iteration 5
	1) Dry run of the comparison algorithm
	2) Mission Status devition funcionality
	3) Testing of the comparison algorithm
    
    Deliverables:
	- Mission status generation functionality
	
#### Iteration 6
	1) Rigours system testing
	2) Visualisation of the mission plans and images captured by drone
	3) Application handover

    Deliverables:
	- Complete running application 


## Additional Notes

### Challenges Faced

* Efficient client side extraction of exif and xmp data from the images uploaded to the application. 
* Determining an efficient algorithm for comparison of the extracted data from image and data from the plan as not all data from the image is clearly understood and also determining clever error margins based on data discrepancy.
* Limited test data
* Real time testing was not possible.

### Future goals

 * Admin functionalities like 
    * Registering a new user through the application
    * Creation/removal of plan objects for users
    * User/Plan update/removal
    * Admin notification in case of failures
 * Unit/Integration tests for the modules
 
 ### Final Burndown Chart
 
 ![Final Burndown Chart](https://github.com/BU-NU-CLOUD-SP18/Drone-Mission-Analysis/blob/master/public/assets/images/Final_Burndown_Chart.png)
 
 ### Built With
 
 * [Node.js](https://nodejs.org/en/) - JavaScript runtime
 * [Express](https://expressjs.com/) - Web Server 
 * [Babel](https://babeljs.io/) - ES6 Compiler
 * [Amazon Cognito Identity](https://github.com/aws/amazon-cognito-identity-js) - Amazon Cognito Identity SDK for authentication
 * [Cognito Express](https://www.npmjs.com/package/cognito-express) - Helper package for Cognito token authentication
 * [Compression](https://github.com/expressjs/compression) - to compress Express response
 * [Cors](https://github.com/expressjs/cors) - to make the app cors compatible
 * [Express Session](https://github.com/expressjs/session) - to create session to hold cognito tokens
 * [Helmet](https://github.com/helmetjs/helmet) - to secure the app
 * [AngularJS](https://angularjs.org/) - Front/Client end of the app
 * [Ng File Upload](https://github.com/danialfarid/ng-file-upload/) - For file uploads
 * [AngularJS Google Maps](https://ngmap.github.io/) - For showing maps






