class Tile extends Component {

    x = 0;
    y = 0;
    value = 2;


    constructor(parent, isEmpty) {
        super(parent, 'components/tile/style.css');
        this.isEmpty = isEmpty;
    }

    updateValue(value) {
        this.value = value;
        this.element.innerHTML = value;
        this.element.classList.remove("color" + value / 2);
        this.element.classList.add("color" + value);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = "calc((var(--tile-size) + var(--tile-gap))* " + x + ")";
        this.element.style.top = "calc((var(--tile-size) + var(--tile-gap))* " + y + ")";
    }

    getHTML() {
        const div = document.createElement("div");
        div.classList.add("tile");

        if (this.isEmpty) {
            div.classList.add("empty");
        } else {
            const randomBeginning = ["2", "2", "2", "2", "4"];
            div.innerHTML = randomBeginning[Math.round(Math.random() * (randomBeginning.length - 1))];
            if (div.innerHTML == "4") {
                div.classList.add("color4");
                this.value = 4;
            }
        }

        return div;
    }



}