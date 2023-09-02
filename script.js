const components = [
    "tile", "playground"
];

async function loadingScript() {
    for (let i = 0; i < components.length; i++) {
        const task = new Promise(done => {
            const script = document.createElement("script");
            script.src = `components/${components[i]}/${components[i]}.js`;
            script.onload = () => {
                done();
            }

            document.body.appendChild(script);
        })
        await task;
    }
}


var newGame = function () {};

async function main() {
    await loadingScript();

    const playground = new Playground(document.querySelector(".game-container"));
    playground.render();

    newGame = () => {
        playground.takenTiles = {};
        playground.reset();

    }

}


main();