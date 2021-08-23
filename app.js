"use strict"

const repos = document.createElement('repos');
const reposComponents = document.querySelectorAll('repos');

for (let i = 0; i < reposComponents.length; i++) {
    createReposComponent(reposComponents[i]);
}

async function createReposComponent(reposComponent) {
    const userName = reposComponent.getAttribute('data-user'),
    updateDate = reposComponent.getAttribute('data-update');

    const container = document.createElement('div');
    const userNameHeader = document.createElement('h2');
    userNameHeader.textContent = userName;
    container.appendChild(userNameHeader);

    const { repos, error } = await fetchRepos(userName, updateDate);
    if (error) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = `Error occured while fetching repos for user: '${userName}'.`;
        container.appendChild(errorMessage);
    } else {
        const reposTable = buildReposTable(repos);
        container.appendChild(reposTable);
    }

    document.body.replaceChild(container, reposComponent);
}

async function fetchRepos(userName, updateDate) {
    let error;
    const repos = await fetch(`https://api.github.com/users/${userName}/repos`)
        .then(response => {
            if (!response.ok)
                throw Error(response.statusText)
            return response;
        }).then(response => response.json())
        .catch(err => error = err);

    return ({
        repos: error ? [] : repos.filter(r => r.updated_at >= updateDate).map(mapRepo),
        error
    });
}

function buildReposTable(repos) {
    if (!repos.length) {
        const noReposInfo = document.createElement('p');
        noReposInfo.textContent = 'There is no such repositories'
        return noReposInfo;
    }

    const propertyNames = Object.getOwnPropertyNames(repos[0]);
    const reposTable = document.createElement('table');
    const tableHeader = document.createElement('tr');
    reposTable.appendChild(tableHeader);
    propertyNames.forEach(propName => {
        const propHeader = document.createElement('th');
        propHeader.textContent = propName;
        tableHeader.appendChild(propHeader);
    });

    repos.forEach(repo => {
        const tableRow = document.createElement('tr');
        reposTable.appendChild(tableRow);
        Object.entries(repo).forEach(e => {
            const tableCell = document.createElement('td');
            if(e[0] === 'download') {
                const downloadLink = document.createElement('a');
                downloadLink.href = e[1];
                downloadLink.textContent = e[0];
                tableCell.appendChild(downloadLink);
            } else {
                tableCell.textContent = e[1];
            }
            tableRow.appendChild(tableCell);
        });
    });

    return reposTable;
}

const mapRepo = ({name, description, updated_at, svn_url, default_branch}) =>
    ({name, description, updated_at, download: `${svn_url}/archive/refs/heads/${default_branch}.zip`});
