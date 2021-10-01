let request=require("request");
let cheerio=require("cheerio");
let path=require("path");
let fs=require("fs");
//let path=require("path");
//const { table } = require("console");
let mainUrl="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(mainUrl,cb);
function cb(error,response,html){
    if(error){
        console.log(error);
    }
    else{
        allMatchUrl(html);
    }
}
//this function will open page that shows result of all matches that occured in ipl
function allMatchUrl(html){
    let mainPage=cheerio.load(html);
    let allMatchPage=mainPage(".widget-items.cta-link a").attr("href");
  // for(let k=0;k<allMatchPage.length;k++){ 
    let allIplUrl="https://www.espncricinfo.com"+allMatchPage;
    // console.log(allIplUrl);
    request(allIplUrl,cb);
    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            sabLink(html);
        }
    }
   //this function will extract each match result page which contains all details of that match and send ahead to pen it
    function sabLink(html){
      //  console.log(html);
        let allInOne=cheerio.load(html);
        //console.log(allInOne(allInOne).html());
        let allLinks=allInOne(".match-score-block .match-info-link-FIXTURES");
       //console.log(allLinks.length);    
        for(let i=0;i<allLinks.length;i=i+4){
            let halfLink=allInOne(allLinks[i]).attr("href");
          // console.log(halfLink);
            let matchUrl="https://www.espncricinfo.com"+halfLink;
           linkKholo(matchUrl);
        }
    }
    // this function will open each match page 
    function linkKholo(url){
        //console.log(url);
        request(url,cb);
        function cb(error,response,html){
            if(error){
                console.log(error);
            }else{
                dataBharo(html);
            }
        }
    }
    
    function dataBharo(html){
        let dhundho=cheerio.load(html);
        let cwd=process.cwd();
        let iplPath=path.join(cwd,"IPL");
        if(fs.existsSync(iplPath)==false){
            fs.mkdirSync(iplPath);
        }
        let teams=dhundho(".name-link");
        let firstTeamName=dhundho(teams[0]).text();
        let SecondTeamName=dhundho(teams[1]).text();
       //console.log(teams.length);
        let firstTeamPath=path.join(iplPath,firstTeamName);
        let SecondTeamPath=path.join(iplPath,SecondTeamName);
        if(fs.existsSync(firstTeamPath)==false){
            fs.mkdirSync(firstTeamPath);
        }
        if(fs.existsSync(SecondTeamPath)==false){
            fs.mkdirSync(SecondTeamPath);
        }
        let tableArr=dhundho(".card.content-block.match-scorecard-table .Collapsible");
        for(let i=0;i<tableArr.length;i++){
            let currTeam =dhundho(tableArr[i]).find(".header-title.label");
            let currTeamName=dhundho(currTeam).text();
            let ct=currTeamName.split("INNINGS"); 
            if(firstTeamName==ct[0].trim()){
                let allRows=dhundho(tableArr[i]).find(".table.batsman tr");
                // console.log(dhundho(allRows[0]).text());
                for(let j=0;j<allRows.length;j++){
                    //console.log(dhundho(allRows[j]).hasClass("batsman-cell text-truncate out"));  
                    let playName=dhundho(allRows[j]).find("td");
                  if(dhundho(playName[0]).hasClass("batsman-cell")==false){
                    continue;
                  }
                 let actPlayName=dhundho(playName[0]).text();
                 //console.log(playName.length);
                 let playPath=path.join(firstTeamPath,actPlayName+".json");
                 if(fs.existsSync(playPath)==false){
                     fs.writeFileSync(playPath,"myTeamName\tname\tvenue\tdate\topponent\tresult\tR\tB\t4s\t6s\tSR\n");
                    }
                    let venueNikalo=dhundho(".match-header .match-info.match-info-MATCH.match-info-MATCH-half-width .description");
                    let match1=dhundho(venueNikalo[0]).text();
                    let arr2=[];
                    arr2.push(match1);
                    for(let q=1;q<venueNikalo.length;q++){
                        let ven=dhundho(venueNikalo[q]).text();
                        if(match1.length!=(ven).length){
                            match1=dhundho(venueNikalo[q]).text();
                            arr2.push(match1);
                        }
                    }
                    // let vkr=dhundho(arr2[0]).text();
                    let venueArr=arr2[0].split(",");
                    let venue=venueArr[1];
                   // console.log(ven);
                   // venue.trim();
                    let date=venueArr[2];
                   // date.trim();
                    let resultNikalo=dhundho(".status-text");
                    let result=dhundho(resultNikalo).text();
                    result.trim();
                    let yeBharo=firstTeamName+"\t"+actPlayName+"\t"+venue+"\t"+date+"\t"+SecondTeamName+"\t"+result+"\t";

                  for(let k=0;k<playName.length;k++){
                    let dataToAdd=dhundho(playName[k]).text();
                    dataToAdd.trim();
                   // dataToAdd+=firstTeamName+"\t"+actPlayName+"\t"+"\t"
                    fs.appendFileSync(playPath,yeBharo+dataToAdd+"\t");
                  }
                  fs.appendFileSync(playPath,"\n");
                }
            }
            else{
                let allRows=dhundho(tableArr[i]).find("tr");
                for(let j=0;j<allRows.length;j++){
                    let playName=dhundho(allRows[j]).find("td");
                    let actPlayName=playName[0];
                    let playPath=path.join(SecondTeamPath,actPlayName+".json");
                    
                    let dataToAdd=dhundho(allRows[j]).text();
                    dataToAdd.trim();
                    if(fs.existsSync(playPath)==false){
                        fs.writeFileSync(playPath,dataToAdd);
                    }
                    fs.appendFileSync(playPath,"\n"+dataToAdd);
                }
            }
        }
    }
}
