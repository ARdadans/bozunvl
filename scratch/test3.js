console.log("Hyphen with \\b:", /\blast-ch-number\b/.test("class=\"last-ch-number\""));
console.log("With spaces:", /\blast-ch-number\b/.test("class=\" last-ch-number \""));
console.log("With other class:", /\blast-ch-number\b/.test("class=\"some-class last-ch-number\""));
