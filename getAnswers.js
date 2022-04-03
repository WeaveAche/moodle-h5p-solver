let json = H5PIntegration.contents;
let interactions = JSON.parse(json[Object.keys(json)[0]].jsonContent).interactiveVideo.assets.interactions;

let html = "";
html += `<h1>Answers</h1>`

for (let i = 0; i < interactions.length; i++) {
    interaction = interactions[i]
    q_type=interaction.libraryTitle
    params=interaction.action.params

    html += `<h2>Question ${i + 1}</h2>`

    if (q_type=="Single Choice Set") {
        answer=params.choices[0].answers[0]
        html += `<p>${answer}</p>`
        console.log(answer)
    } else if (q_type=="Multiple Choice") {
        answers = params.answers
        for (let i = 0; i < answers.length; i++) {
            answer = answers[i]
            if (answer.correct==true)
                html += `<p>${answer.text}</p>`
                console.log(answer.text)
        }
    } else if (q_type=="True/False Question") {
        console.log(params.correct)
        html += `<p>${params.correct}</p>`
    } else 
        console.log("wait")
    
    console.log("\n")
}

const win = window.open('', 'answers', 'width=400, height=600');
win.document.write(html);
