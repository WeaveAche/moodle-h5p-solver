function getAnswers(){
    var answers = [];
    let json = H5PIntegration.contents;
    let interactions = JSON.parse(json[Object.keys(json)[0]].jsonContent).interactiveVideo.assets.interactions;

    for (let i = 0; i < interactions.length; i++) {
        let currAnswer = [];
        let interaction = interactions[i];
        let q_type = interaction.libraryTitle;
        let params = interaction.action.params;

        if (q_type=="Single Choice Set") {
            currAnswer.push(params.choices.length);
        } else if (q_type=="Multiple Choice") {
            let options = params.answers;
            for (let i = 0; i < options.length; i++) {
                let option = options[i]
                if (option.correct==true){
                    currAnswer.push(option.text);
                }
            }
        } else if (q_type=="True/False Question") {
            currAnswer.push(params.correct);
        }else{
            alert(`I don't know how to solve question ${i+1}`);
            return undefined;
        }

        answers.push(currAnswer)
    }

    return answers;
}


async function autoSolve(answers){
    console.log(answers);
    try{
        let frame = document.querySelectorAll("iframe")[0].contentDocument
        let interactions = frame.querySelectorAll(".h5p-seekbar-interaction");

        solver:
        for(let i = 0; i < interactions.length ; i++){
            let type = interactions[i].title;

            await interactions[i].click();

            while(!frame.querySelector(".h5p-interaction-outer")) {
                await new Promise(r => setTimeout(r, 500));
            }

            if(type == "Single Choice Set"){
                await frame.querySelectorAll(".h5p-sc-is-correct")[0].click();

                let k = 1;
                let timer = setInterval(async()=>{
                    if(k < answers[i][0]){
                        await frame.querySelectorAll(".h5p-sc-is-correct")[k].click();
                        k++;
                    }else{
                        clearInterval(timer);
                    }
                },2500);

            }else if(type == "True/False Question"){
                let options = frame.querySelectorAll(".h5p-true-false-answer");

                if(options[0].innerText.toLowerCase() == answers[i][0]){
                    await options[0].click();
                }else{
                    await options[1].click();
                }


            }else{
                let options = frame.querySelectorAll(".h5p-answer");

                for(let j=0; j< options.length; j++){
                    if(answers[i].includes(options[j].children[0].children[0].innerHTML)){
                        options[j].click();
                    }
                }

            }

            var annoying_error = false;

            if(frame.querySelector(".h5p-question-check-answer")){
                setTimeout(async ()=>{
                    try{
                        await frame.querySelector(".h5p-question-check-answer").click();
                    }catch(err){
                        console.log(err);
                        annoying_error = true;
                    }
                }, 2000);
            }                
            
            while(!frame.querySelector(".h5p-question-iv-continue")) {
                if(annoying_error){
                    continue solver;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            setTimeout(async ()=>{
                await frame.querySelector(".h5p-question-iv-continue").click()
            }, 1000);


            while(frame.querySelector(".h5p-interaction-outer")) {
                await new Promise(r => setTimeout(r, 500));
            }

        }

        await frame.querySelector(".h5p-control.h5p-star.h5p-star-foreground").click();

    }catch(e){
        alert(e)
    }
}

var answers = getAnswers();
if(answers){
    autoSolve(answers)
}