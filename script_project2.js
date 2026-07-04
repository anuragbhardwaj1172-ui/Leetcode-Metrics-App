document.addEventListener('DOMContentLoaded',function(){
    const searchButton = document.getElementById('search-btn');
    const usernameInput =document.getElementById('user-input');
    const stasContainer = document.querySelector('.stats-container');
    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');
    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');
    const cardStatsContainer = document.querySelector('.stats-card')


    // return true or false based on a regex
    function validateUsername(username){
        if(username.trim()===""){
            alert("Username should not be empty");
        return false;
    }
        const regex = /^[a-zA-z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Username invalid");
        }
        return isMatching
    }
    async function fetchUserDetails(username){
        const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`
        try{
            searchButton.textContent='Searching...';
            searchButton.disabled= true;

            const proxyUrl = 'https://corsproxy.io/?'
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                   redirect: "follow"
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            // const url= `https://leetcode.com/graphql`
            // const response= await fetch(url);
            if(!response.ok){
                throw new Error('Unable to fetch the User details');
            }
            const parseddata = await response.json();
            console.log('logging data: ',parseddata);
            displayUserData(parseddata)
        }
        catch{
                stasContainer.innerHTML= '<p>data not found</p>'
        }
        finally{
            searchButton.textContent='Search';
            searchButton.disabled= false; 
        }
    }


    function updateProgress(solved,total,label,circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty('--progress-degree',`${progressDegree}%`);
        label.textContent= `${solved}/${total}`;

    }


   function displayUserData(parseddata) {
        const totalQues = parseddata.data.allQuestionsCount[0].count
        const totalEasyQues = parseddata.data.allQuestionsCount[1].count
        const totalMediumQues = parseddata.data.allQuestionsCount[2].count
        const totalHardQues = parseddata.data.allQuestionsCount[3].count

        const SolvedtotalQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count
        const SolvedtotalQuesEasy = parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count
        const SolvedtotalQuesMedium = parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count
        const SolvedtotalQuesHard = parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count

        updateProgress(SolvedtotalQuesEasy, totalEasyQues, easyLabel , easyProgressCircle);
        updateProgress(SolvedtotalQuesMedium, totalMediumQues, mediumLabel , mediumProgressCircle);
        updateProgress(SolvedtotalQuesHard, totalHardQues, hardLabel , hardProgressCircle);


        const cardsData = [
            {label: "Overall Submission", value:parseddata.data.matchedUser.submitStats.acSubmissionNum[0].submissions
            },
            {label: "Overall Easy Submission", value:parseddata.data.matchedUser.submitStats.acSubmissionNum[1].submissions
            },
            {label: "Overall Medium Submission", value:parseddata.data.matchedUser.submitStats.acSubmissionNum[2].submissions
            },
            {label: "Overall Hard Submission", value:parseddata.data.matchedUser.submitStats.acSubmissionNum[3].submissions
            },
        ]
        console.log("card ka data: ",cardsData);

        cardStatsContainer.innerHTML= cardsData.map(
            data => 
                `<div class="card">
                <h4>${data.label}</h4>
                <p>${data.value}</p>
                </div>`

        ).join("")
      
   }
    

    searchButton.addEventListener('click',function(){
        const username = usernameInput.value;
        console.log("logging username: ", username);
        if(validateUsername(username))
        fetchUserDetails(username);
    })

})