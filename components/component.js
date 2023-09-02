class Component {

    element;

    constructor(parent, styleUrl) {
        this.parent = parent;
        this.styleUrl = styleUrl;
    }

    getHTML() {}

    async render() {
        const html = this.getHTML();
        if (typeof (html) == "string") {
            const div = document.createElement('div');
            div.innerHTML = html;
            this.element = div;
        } else if (html instanceof Promise) {
            this.element = await html;
        } else {
            this.element = html;
        }
        await this.loadStyle();
        this.parent.appendChild(this.element);
        await new Promise((done) => {
            setTimeout(() => {
                done();
            }, 5);
        })
    }

    async reset() {

        this.element.remove();

        const html = this.getHTML();
        if (typeof (html) == "string") {
            const div = document.createElement('div');
            div.innerHTML = html;
            this.element = div;
        } else if (html instanceof Promise) {
            this.element = await html;
        } else {
            this.element = html;
        }
        this.parent.appendChild(this.element);
    }

    hasStyle() {
        const links = Array.from(document.head.querySelectorAll("link"));
        for (let i = 0; i < links.length; i++) {
            if (links[i].getAttribute("href") === this.styleUrl) {
                return true;
            }
        }
        return false;
    }

    loadStyle() {
        return new Promise((done, reject) => {
            if (this.styleUrl && !this.hasStyle()) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.styleUrl;
                link.onload = () => {
                    done();
                }
                document.head.appendChild(link);
            } else {
                done();
            }
        })
    }
}