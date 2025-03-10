// ==UserScript==
// @name         Checkfront helper
// @version      2025-03-10
// @description  Checkfront helper
// @author       Jim Ng
// @match        https://*.checkfront.com/*
// @exclude      https://login.checkfront.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABACAYAAABC6cT1AAAAAXNSR0IArs4c6QAABR1JREFUaEPdm3nobVMUxz/P7MmQIUSZCvVkKiRj5uEhc6Y/hGQMEWVKxkyZE5KhHhGZSqbMmec8YxRRSOZ5PJ/bvrpud9h7n3Pu75zfqtute9da+/s9+5y917DPDP4v8wD7h8/6wDKAv7VRfgEuAs4cBH5Gz4+rAHcB67WR5QDMDwK7AX+MIr4S8AKw7DQh/RSwA+CsDxRn3M9zwEbThPTLwNbA96P4SHp34O5pQvptYAvg63F8JH4nsNc4xRb8/xGwGfB5DFaJfwqsGKPcYJ3PAumPIzAuAMyWuKvefBEGTVX5Ktze70QCvAyYKfF/Ig2aqPYdsBXwaiS4nYAHgJvbTPznYjfaHngmkvRywJshKLuprcR/L2Z5V+ChSNLyVHfboN9K4n8B+yRuwScDF/RcpNYRdz062Gc0cqZV26CY6WeB+dtM/BjgqgTSixbx+mvAan02rZrxU4HzEkireitw4ACb1hC/sEg4fE5T5CDgliEGrSB+LXBECuNwa3uLe6sPksYTnwM4c38nEHcRczFzURsmjSZ+H7An8GcCaVV9LE4aY9NY4o8BOwO/JZI2QDFQ6a0steZWf74IQ7cpZu2nRNLWBw1JDU3HSeNm/A1gS+Dbccj7/neGTT5MQmKkUcTfDzn1lzHI+3SOBy5NsGsM8U+ATUNRJAF/R3XdUCi1wBArjSD+RZjpD2JR9+gtArwCrJFoO+XEvwnPtItSjtwYkpZU2ykl/mNYva3n58i+wO05hsCUEf81rMCPZwJfGXgdWDzTPpr4I8DqgB2XsmIktgdwf6YjC6N2SjbOtNcsirhJwpFhEFfeA4C9gSUzBjbmNk28LcO2a3JOURk2RS0jY4lfAxw9oBLr1rFjuAi7FGWdhSJRHA5cF6k7SM3gxnC2bAd3JPErgWMjQC4Wbl3vBEu9w0CZOFwc4W+YylJFu8vIboUSPrqmQ4lfXoSNx2UMsDywX7gT7K935ewitTwjw1+vyT2h7VvSTcd8IHGTA6OhD0uOsGa4ALo5vaSvoxJrbeOGGzrjNt5stb47zsME/l+rSFFfSlhHYiCNfMZNFkwP34rxVJPOwoH0rIr9j13V7TNvl9CbqhgfbqXuBFXLWOIOaG7ssYrc0DIXdJ0HFqKIC/yHUAp6OpdFop39ereunCApZqho4jqzO2mjzgCiTjEOMIbfvMZBkoiLw+TCONujVHWJ+/1ZdTkPfpOJa2eL1m7lvTWA2wR4Epi3Bt+9LrOI68AMyxD1jgoBLhFSzSoywHGwsonr2D61LVsbc1WIF9GsbxJSirgATTPdZ28oifawkllb6vCliTugzXqzuJS+dS9QY3oLhjNT0ZfQr4R4d/yctHPBEBitU4JEjmmlxAVgFmaFJFZMf2Ny/lh/sXqVE3fgc4tV/7QIBLNL1N0i3I9UqYW4I14CnDhiaAsW1tKXLssg07424uK5ujhF7GGd/pOThqQPh3w/E3dps1qJi85tzu2u90TDKcD5paGXc1A7ceEZ4BjoGPBsGI5pTPWh4YkQl7xRmbX5F4uTSKuWm6xKrCdGXLRWcywRN0EmSrwJhLsYOsR9aWXYebAmga0SyxUSt8SzdpVeW+DrBInHnAtrAZckiLMk7huG7/Uda07y0jLlRz2w3z0IN4k6VxOuj+0xY4m5XeJ+X1+cOjqkCehqwiBpKzydQmn/0cdDQ1o5Xd4x7V7DJ0L6+187bNCZT5v+9rm7r1HXXfGsaYI7pXBfJrQPMLd/kH8BMroEOLC9mpkAAAAASUVORK5CYII=
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.min.js
// ==/UserScript==

(function() {
    // Common
    const baseUrl = `https://${location.hostname}/api/4.0/internal`;
    const getProductsUrl = `${baseUrl}/products?offset=0&limit=500&status=active&type=product`;
    const productUrl = `${baseUrl}/products`;

    // Init
    let initArr = [false, false];
    const initStatus = document.createElement("span");
    initStatus.innerHTML = 'Loading...';
    initStatus.style = 'color: red';
    function updateInitStatus(idx) {
        initArr[idx] = true;
        if (initArr.every((x) => x)) {
            initStatus.innerHTML = 'Ready';
            initStatus.style = 'color: green';
        }
    }
    let csrfToken = '';
    fetch(location.hostname)
        .then(resp => resp.text())
        .then(text => { csrfToken = text.match(/\"csrfToken\"\: \"(\w+)\"/)[1] })
        .then(() => updateInitStatus(0));
    let allProductIds = [];
    fetch(getProductsUrl, { method: 'GET' })
        .then(resp => resp.json())
        .then(json => { allProductIds = json.data.map(x => x.id); console.log(allProductIds) })
        .then(() => updateInitStatus(1));

    // Processing UI
    const loader = document.createElement("span");
    const loaderInnerHTML = 'Processing: ';
    const loaderStyle = `
position: absolute;
display: flex;
width: 100%;
height: 100%;
margin-left: -12px;
margin-top: -12px;
justify-content: center;
align-items: center;
z-index: 1000;
background-color: #efefef;`;
    loader.innerHTML = loaderInnerHTML;
    loader.style = loaderStyle + 'display: none;';
    let totalToProcess = 0;
    let processed = 0;
    let failed = 0;

    // Actions
    const convertTimeslotOptions = (bookingDisplay) => {
        totalToProcess = allProductIds.length;
        processed = 0;
        failed = 0;
        loader.style = loaderStyle;
        Promise.map(allProductIds, (productId) => {
            return fetch(`${productUrl}/${productId}`, { method: 'GET' })
                .then(resp => resp.json())
                .then(json => {
                    const cfMeta = json.data.cfMeta;
                    cfMeta.timeslotOptions.bookingDisplay = bookingDisplay;

                    return fetch(`${productUrl}/${productId}`, {
                        "headers": {
                            "content-type": 'application/json;charset=UTF-8',
                            "x-csrf-token": csrfToken
                         },
                         "body": JSON.stringify({ cfMeta }),
                         "method": "PATCH"
                     });
                 })
                 .then(() => processed++)
                 .catch((err) => failed++)
                 .finally(() => {
                     loader.innerHTML = `${loaderInnerHTML}${(processed + failed)} / ${totalToProcess}`;
                 });
        }, { concurrency: 5 })
        .finally(() => {
            loader.style = loaderStyle + 'display: none;';
            alert(`Success: ${processed}, failed: ${failed}`);
        });
    };

    // Main UI
    let showMenu = false;

    const button = document.createElement("Button");
    const buttonInnerHTML = '<img src="https://sandboxvr.imgix.net/logo-mark.pdf?fm=png&h=15&dpr=2&invert=true">';
    const buttonStyle = 'height:50px;top:20px;left:20px;position:fixed;z-index:9999;';
    button.innerHTML = buttonInnerHTML;
    button.style = buttonStyle;
    document.body.appendChild(button);

    const convertToButtonsButton = document.createElement("Button");
    convertToButtonsButton.innerHTML = 'Convert ALL product timeslots to buttons';
    convertToButtonsButton.addEventListener('click', () => {
        if (!confirm("Are you sure?")) {
            return;
        }

        convertTimeslotOptions('buttons');
    });

    const convertToDropdownButton = document.createElement("Button");
    convertToDropdownButton.innerHTML = 'Convert ALL product timeslots to dropdowns';
    convertToDropdownButton.addEventListener('click', () => {
        if (!confirm("Are you sure?")) {
            return;
        }

        convertTimeslotOptions('dropdown');
    });

    const menu = document.createElement("div");
    const menuStyle = `
display: flex;
flex-direction: column;
row-gap: 8px;
background-color: #efefef;
width: 500px;
padding: 12px;
border: 2px solid black;
top: 70px;
left: 20px;
position: fixed;
z-index: 9999;`;
    menu.innerHTML = '';
    menu.style = menuStyle + (showMenu ? '' : 'display:none;');
    menu.appendChild(initStatus);
    menu.appendChild(convertToButtonsButton);
    menu.appendChild(convertToDropdownButton);
    menu.appendChild(loader);
    document.body.appendChild(menu);

    button.addEventListener('click', () => {
        showMenu = !showMenu;
        menu.style = menuStyle + (showMenu ? '' : 'display:none;');
    });
})();