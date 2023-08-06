let rowNumberSection=document.querySelector(".row-number-section");

let formulaBarSelectedCellArea=document.querySelector(".seleted-cell-div")

let formulaInput = document.querySelector(".formula-input-section");
let cellSection=document.querySelector(".cell-section");

let columnTagsSection=document.querySelector(".column-tag-section");

let lastCell;
let dataObj={};


formulaInput.addEventListener("keydown",function(e){
    if(e.key == "Enter"){
     console.log("now evaluating formula");

     let typedFormula = e.currentTarget.value;
     console.log(typedFormula);

     if(!lastCell) return;//agar koi cell selected nhi h

     console.log("not returned");
    //jo type kr rhe h formula bar m cell ko select krke us cell m aajaye
     let selectedCellAdd = lastCell.getAttribute("data-address");
     let cellObj=dataObj[selectedCellAdd];

     cellObj.formula = typedFormula;

     let upstream = cellObj.upstream;

     for(let k =0;k<upstream.length;k++){
      removeFromDownstream(upstream[k],selectedCellAdd);//dusro ki downstream m se khud ko nikal denge 
  }
    cellObj.upstream =[];

    let formulaArr = typedFormula.split(" ");//jo naya formula h use split maar diya space k basis pr
    let cellsInFormula = [];
    
    for(let i=0;i< formulaArr.length; i++){
        
        if( 
            formulaArr[i] !="+" &&
            formulaArr[i] !="-" &&
            formulaArr[i] !="*" &&
            formulaArr[i] !="/" &&
            isNaN(formulaArr[i])
            ){
                cellsInFormula.push(formulaArr[i]);
            }
          }
        for(let i=0;i< cellsInFormula.length;i++){
            addToDownstream(cellsInFormula[i],selectedCellAdd);
        }
        cellObj.upstream = cellsInFormula;

        let valObj = {};

        for(let i=0;i<cellsInFormula.length;i++){
            let cellValue = dataObj[cellsInFormula[i]].value;
    
            valObj[cellsInFormula[i]] = cellValue;
        }

        for(let key in valObj){
            typedFormula = typedFormula.replace(key,valObj[key]);
        }
    
        let newValue =eval(typedFormula);

        lastCell.innerText = newValue;

        cellObj.value = newValue;

        let downstream = cellObj.downstream;

        for (let i = 0; i < downstream.length; i++) {
          updateCell(downstream[i]);
        }
    
        dataObj[selectedCellAdd] = cellObj;
    
        formulaInput.value = "";
}

});
cellSection.addEventListener("scroll",function (e){

 rowNumberSection.style.transform=`translateY(-${e.currentTarget.scrollTop}px)`;//is wali line m dikkat
 columnTagsSection.style.transform=`translateX(-${e.currentTarget.scrollLeft}px)`;
});
for(let i=1;i<=100;i++){
    let div=document.createElement("div");
    div.innerText = i;
    div.classList.add("row-number");//iski zarurat kya thi
    rowNumberSection.append(div);
}


for(let j=0;j<26;j++){
    
    
    let asciiCode = 65+j;
    let reqAlphabet=String.fromCharCode(asciiCode);//ascii to alphabet convert krne k liye
    let div=document.createElement("div");
    div.innerText=reqAlphabet;
    div.classList.add("column-tag");
    columnTagsSection.append(div);

}

//inside this nested for loop we are creating cells UI + cell obj
for(let i=1;i<=100;i++){
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for(let j=0;j<26;j++){
        let asciiCode= 65+j;
        let reqAlphabet = String.fromCharCode(asciiCode);
        let cellAddress=reqAlphabet+i;

        dataObj[cellAddress]={
            value: undefined,
            formula:undefined,
            upstream:[],
            downstream:[],
        }
        let cellDiv = document.createElement("div");
          
        cellDiv.addEventListener("input",function(e){
        let  currCellAddress = e.currentTarget.getAttribute("data-address");
        //currCellAddress m us cell ka adress store krva liya jisme hum input daal rha h
        let currCellObj = dataObj[currCellAddress];
        //uska object nikal liya

        currCellObj.value=e.currentTarget.innerText;
        currCellObj.formula = undefined;

        //1.-loop on upstream
        //2.for each cell go to its downstream and remove ourself
        //3.apni upstream ko empty array krdo

        let currUpstream = currCellObj.upstream;

        for(let k=0;k<currUpstream.length;k++){
            //remove from down stream(parent,child)

            removeFromDownstream(currUpstream[k],currCellAddress);
        }

        currCellObj.upstream=[];
        
        let currDownstream = currCellObj.downstream;

        for(let i=0;i< currDownstream.length;i++){
            updatecell(currDownstream[i]);//jo jo ise use kr rha tha vha ja kr iski value update krni padegi
        }

        dataObj[currCellAddress] = currCellObj//ye line

        console.log(dataObj);
        });

        cellDiv.contentEditable = true;
        cellDiv.classList.add("cell");

        cellDiv.setAttribute("data-address",cellAddress);
        cellDiv.addEventListener("click",function(e){
            if(lastCell){//yha hume is not equal to undefined nhi likhna padega
                lastCell.classList.remove("cell-selected");
            }
            e.currentTarget.classList.add("cell-selected");

            lastCell=e.currentTarget;

            let currCellAddress=e.currentTarget.getAttribute("data-address");

            formulaBarSelectedCellArea.innerText=currCellAddress;

        })
        rowDiv.append(cellDiv);
     }
    
    cellSection.append(rowDiv);

}


//C1 = Formula(2*A1)
//A1 = parent
//C1 = child

//is function kisi ki upstream se mtlb nhi hai
//iska bs itna kaam h ki parent do and child do,aur mai parent ki downstream se child ko hta dunga
//taki unke beech ka connection khtm hojai
//taki agr parent update ho to connection khtm hone ke baad child update na ho

function removeFromDownstream(parentCell,childCell){
    //1 fetch parentCell's downstream

    let parentDownstream = dataObj[parentCell].downstream;
    
    //2-filter kro childcell ko parent ki downnstream se

    let filteredDownstream =[];

    for(let i=0;i<parentDownstream.length;i++){
        if(parentDownstream[i] != childCell){//hum isme se direct ye check nhi kara sakte the ki jo equal h use remove kar de
            filteredDownstream.push(parentDownstream[i]);
        }
    }

    //3- filtered upstream ko wapis save krwado dataObj me req cell me
    dataObj[parentCell].downstream = filteredDownstream;
}

function updatecell(cell){
    let cellObj = dataObj[cell];
    let upstream = cellObj.upstream;
    let formula = cellObj.formula;//A1 + B1

    //upstream me jobhi cell hai unke objects me jaunga whase unki value lekr aunga
    //wo sari values mai ek object me key value pair form me store krunga where key being the cell address

    //{
    //  A1:20;
    //  B1:10;
    //}

    let valObj = {};//ek object jo ki ek formule m istemal hone vaali saari values store karega

    for(let i=0;i<upstream.length;i++){
        let cellvalue = dataObj[upstream[i]].value;//upstream m jo A,B ya C pada h dataobject m jakar uski value nikalna

        valObj[upstream[i]] = cellvalue;//humne jo values store krne k liye object banaya h usme value dal jayegi

    }
    for(let key in valObj){
        formula = formula.replace(key,valObj[key]);//yha jo key h ye i i tarah kam kr rha h matlab jo sbse phle value h usme ye daaldo
    }

    
    let newValue = eval(formula);//jo string formula m store ho gyi jaise 20+30 eval use evaluate ke dega ye predefined h
    
    let cellOnUi = document.querySelector(`[data-address='${cell}']`);
    cellOnUi.innerText = newValue;
  
    dataObj[cell].value = newValue;

    let downstream = cellObj.downstream;

    for(let i=0;i<downstream.length;i++){//ye basecase h jb kisi ki downstream empty hogi to loop laut jayega
       updatecell(downstream[i]);//ye humne recursion laga diya ki A1 pr b1 depend h aur C1 b1 pr to agar A1 m change aa rahe h to phle B! ki value aur downstream m change aur fir C1 ki value aur downstream
    }
}
function addToDownstream(parent, child) {
    // child ko parent ki downstream me add krna hai
  
    dataObj[parent].downstream.push(child);
  }


