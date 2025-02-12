
const generateUniqueName = async () => {
    const response = await fetch('https://randomuser.me/api/?inc=name&nat=US');
    const json = await response.json();
    const result = json.results.at(0);

    if (result) {
        return `${result.name.title} ${result.name.first} ${result.name.last[0]}.`;
    }

    return null;
}

export {generateUniqueName};