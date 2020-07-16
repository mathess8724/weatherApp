import React from 'react';
import './Home.scss';
import * as Chart from 'chart.js'
import { useRef } from 'react';
import ReactDOM from "react-dom";
import { useState } from 'react';
import { useEffect } from 'react';
import Axios from 'axios';
import * as Moment from 'moment';
import Config from './data/Config';

function Home() {   
    
    const refContainer = useRef();
    const inputRef = useRef();

    const [cityGeo,setCityGeo] = useState([])
    let ctx ;
    let start;
    let end = Config();    
    let id= '2885679';
    
    
    const [icoSrc, setIcoSrc] = useState();
    const [tempNow, setTempNow] = useState();
    const [nbDays, setNbDays] = useState(0);
    const [weatherDesc, setWeatherDesc] = useState();
    const [dataLabels,setDataLabels] = useState ([]);
    const [dataTemps,setDataTemps] = useState ([]);
    const [testLabels, setTest] = useState(['654684', 'ho', 'he'])

    useEffect( () => {      
       
       
        
    },[]);

////////////////////////////////////////////////////////////
//      API Functions                                   ////

    //obtaining gps for the city 
    async function searchCityGeo(city, nbDays){
        console.log('serach coord for ' + city)
        await Axios.get(`https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}${end}`)
        .then( (response) => {
        let tempGeo = response.data.city.coord;        
        getData(tempGeo,city, refContainer, nbDays)
    })
    .catch((error) => {
        error.message ? console.log('city not found!') : console.log('city found!') 
        })
    
    }
   
    function handleCoord(city, nbDays){      
      searchCityGeo(city, nbDays)
      setNbDays(nbDays)      
    }   

    //obtaining the weather history from API
      async function  getData(cityGeo,cityName, refContainer, nbDays) {
        setNbDays(nbDays)
        let dataLink ;
        if(nbDays === 7){
            console.log('search for next 7 days')           
            //console.log()
            dataLink =`https://api.openweathermap.org/data/2.5/onecall?lat=${cityGeo.lat}&lon=${cityGeo.lon}&exclude=hourly&units=metric${end}`
            //console.log(dataLink)
            }

            else if(nbDays === 5){
            console.log('search for 5 previous days')
            let date = Date.now()
            let dateP = new Date(Date.now())
                dateP.setDate(dateP.getDate() -5)
                dateP = Math.round(dateP.getTime() /1000)
            console.log(dateP)            
            dataLink =`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${cityGeo.lat}&lon=${cityGeo.lon}&dt=${dateP}&units=metric${end}`
            console.log(dataLink)
            }
            else if(nbDays === 0){
                console.log('search for today')
                let dateP = Date.now()   
                dataLink =`https://api.openweathermap.org/data/2.5/onecall?lat=${cityGeo.lat}&lon=${cityGeo.lon}&dt=${dateP}&units=metric${end}`
                //console.log(dataLink)
            }

             await Axios.get(dataLink)
            .then( async (response) => {
                
             let dt2 = response.data.daily
             start = response.data.daily
    
             //formating data
             let daysArray = []
             let tempArray = []
             let hourly = response.data.hourly
             let hourlyArray = []
             let hourlyArray12 =[]
             let hourlyTemp = []
             let maxTemp ;
             setIcoSrc(`http://openweathermap.org/img/wn/${response.data.current.weather[0].icon}@2x.png`)
             setWeatherDesc(response.data.current.weather[0].description)               
             setTempNow(`${response.data.current.temp} °C` )
             //console.log(response.data.current.weather[0].description)
             //console.log(hourlyArray12)

             for (let hour in hourly){
                //console.log(hourly[hour])
                //let formatDt = new Date()
                let formatDt = hourly[hour].dt
                formatDt = new Date(formatDt * 1000)
                    hourlyArray.push(formatDt.toLocaleTimeString('fr-FR'))
                    hourlyArray12.push(formatDt.toLocaleTimeString('en-US'))
                    hourlyTemp.push(hourly[hour].temp)
             }
             for ( let day in dt2) {
                 //console.log(dt2)
                 let formatDt = dt2[day].dt.toString()
                 formatDt = formatDt + '000'
                 formatDt = parseInt(formatDt)
                 formatDt = Moment(formatDt).format('dddd D ')
                
                     daysArray.push(formatDt)
                     tempArray.push(dt2[day].temp.day)
                 
                 setDataLabels(daysArray)
                 setDataTemps(tempArray)
    
                 // set canvas with chartJS
                 
                 ctx = refContainer.current.getContext('2d');

                 maxTemp = hourlyTemp.slice(0,21).sort(function (a, b) {
                    return a - b;
                    
                  });
                     
                let gradient = ctx.createLinearGradient(0, 0, 0, 600)
                gradient.addColorStop(0.33, '#ff000094')
                gradient.addColorStop(0.66, '#ffe30091')
                gradient.addColorStop(1, '#00cfff66')
                 
                 var chart = new Chart(ctx, {
                     // The type of chart we want to create
                     type: 'line',
                 
                     // The data for our dataset
                     data: {
                         labels:  nbDays > 0 ? daysArray : hourlyArray.slice(0,21),
                         datasets: [{
                             
                             label: nbDays > 0 ? `Evolution for next 7 days` : `Evolution for today` ,
                             
                             backgroundColor: gradient,
                             borderColor: 'rgb(255, 99, 132)',
                             data: nbDays > 0 ? tempArray : hourlyTemp.slice(0,21),
                             pointRadius: 15,
                             pointHoverBorderColor: '#00ffe7',
                             pointHoverRadius: 15,
                             fill: true,
                             showLine: true
                             
                         }]
                     },
                 
                     // Configuration options go here
                    options: {
                        title: {
                            display: true,
                            text: `Weather evolution for ${cityName}`
                        },
                        elements : {
                            points: {
                                
                            }
                        }
                    }
                 },
                 
            );
    
      }                
      
            })
            .catch((error) => {
              console.log(error.message)
            })
            
        
        
        
    }

    function handleKeyUp(e){
        if (e.key === 'Enter'){
            handleCoord(inputRef.current.value, nbDays)
        }
    }
    

  return (

    

    <div className="HomeBody">        
        <div className="searchContainer">
             <div style={{marginRight:'20px'}}>{tempNow}</div>
             <div>{weatherDesc}</div>
            <div className="weatherIconeContainer">
                {
                    icoSrc
                    ?                   
                    <img className='icoImg' src={icoSrc} alt=""/>
                    :
                    <div></div>
                }
            </div>
            <div className="inputBox">
            <input onKeyUp={ (e) => handleKeyUp(e)} className='inputCity' ref={inputRef}  type="text" placeholder='Enter city name'/>
            </div>
        </div>
    <div>
            {
                tempNow
                ?
                <div>
                <button onClick={ () => handleCoord(inputRef.current.value, 0)} className={ nbDays > 0 ? 'btnChart' : 'btnChartOn'} style={{marginRight:'20px', marginLeft:'30px'}}>Today</button>
                <button onClick={ () => handleCoord(inputRef.current.value, 7)} className={ nbDays > 0 ? 'btnChartOn ' : 'btnChart'} style={{marginRight:'20px'}}>Next 7 days</button>
                </div>
                :
                <div></div>
            }
        </div>
        <div className="canvasContainer">
            <canvas style={{height:'80vh', width:'90vw'}} ref={refContainer}  id='myChart' className='myChart'>
        </canvas>             
            </div>         
            
        </div>
   
  );
}

export default Home;
