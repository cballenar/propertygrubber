# Log

## 2021-10-05
- Figured out the issue... the timeout was running just fine but because these are async functions pretty much they all waited and then executed at the same time making the timeout pretty much pointless... so it looks like we gotta do an actual loop as suggested at one point but i didn't understand the need for it then.
- Still need to fully understand the importance of `new` when making a promise.
- The simplified version below is the sample I used to test the basics, it returns the data in about 1-2secs.

```
const htmlparser = require('node-html-parser');
const axios = require('axios').default;
const fs = require('fs');

let file_name = 'sample.json',
    rawdata = fs.readFileSync('resources/'+file_name),
    projects = JSON.parse(rawdata);

var mapped_projects = projects.map((project)=>{
    return new Promise((resolve) => {
            setTimeout(resolve, 1000, project);
        }).then((project)=> {
            return project['slug']
        });
});
Promise.all(mapped_projects).then((projects)=>{
    console.log(projects);
});
```

## 2021-10-03
- Having a hard time understanding Promises and how to work with them.
- Can `array.map` be used with `Promise`s inside? It's not working so far... 
- Seems like the site raised its security, now we're getting 502 errors after looping through requests



## 2021-09-07
After a long struggle...
- Moved from python to js (node) mostly for the novelty of firebase though i gotta admit some things were easier
- Ended up:
    - running script locally,
    - capturing json to file,
    - transforming with an online tool
    - uploading to Zoho Analytics (https://analytics.zoho.com/open-view/2388007000000019163)

## 2021-08-29

- Initialize
    + `python3 -m venv ./`
    + `source ./bin/activate`
        * `deactivate`
    + `pip install requests bs4`
- Setup files
    + Copied structure and basic files from slidegrubber
- Building and testing from CLI
    - Import packages                           success
    - BS URL                                    failed
        * AJAX Request based on generated ID
- Exploring JS
    + search_keys:: `{city: "lima", phase: [], search: "", type: ["departamentos", "casas"], ubigeo: ["miraflores-lima-lima-150122"]}`
- Explored property HTML for key data to extract
```
#tab-flat
#tab-duplex                                 []
    .projectListProperty                        {}
        .projectListProperty__name                  txt
        .projectListProperty__description
            .projectListProperty__img
                [data-links]                            txt
            .projectListProperty__data
                .button
                    [data-name]
                    [data-id]
                .price
                    b                               txt($ 999,999)
                .meters                             txt(999.99 m2)
                .bedroom                            txt(99 dorm)
                .pisos                              txt(Piso: 99)
.update-date                                        txt(Actualizado el 99.99.9999)

```
- Pulled full department data

The site's search data can be retrieved via the browser console. this variable contains ALL the results under the current criteria, the criteria seems to be specific to the URL which appears to be IDd in the backend as well. Each property also goes through this so even if you have the real property slug, you can't get to it without a prefix.

Use this as a the resource to feed the script for now

```
console.log(JSON.stringify(search_data))
```