# Log

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

--
## 2021-09-07
After a long struggle...
- Moved from python to js (node) mostly for the novelty of firebase though i gotta admit some things were easier
- Ended up:
    - running script locally,
    - capturing json to file,
    - transforming with an online tool
    - uploading to Zoho Analytics (https://analytics.zoho.com/open-view/2388007000000019163)
