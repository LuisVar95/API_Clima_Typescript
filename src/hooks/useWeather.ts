import axios from "axios"
import { z } from 'zod'
//import { object, string, number, InferOutput, parse} from "valibot"
import { SearchType } from "../types"
import { useMemo, useState } from "react"

//TYPE GUARD O ASSERTION
/*function isWeatherResponse(weather : unknown) : weather is Weather {
    return (
        Boolean(weather) && 
        typeof weather === 'object' &&
        typeof (weather as Weather).name === 'string' &&
        typeof (weather as Weather).main.temp === 'number' &&
        typeof (weather as Weather).main.temp_max === 'number' &&
        typeof (weather as Weather).main.temp_min === 'number'
    )
}*/

//Zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
})

export type Weather = z.infer<typeof Weather>

// Valibot
/*const WeatherScehma = object({
    name: string(),
    main: object({
        temp: number(),
        temp_max: number(),
        temp_min: number()
    })
})
type Weather = InferOutput<typeof WeatherScehma>*/

const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
}

export default function useWeather() {

const [weather, setWeather] = useState<Weather>(initialState)
const [notFound, setNotFound] = useState(false)
  
    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY
        setWeather(initialState)
        try {
            const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${search.city},${search.country}&appid=${appId}`
            const {data} = await axios.get(geoUrl)

            //Comprobar si existe
            if(!data.coord.lat || !data.coord.lon) {
                setNotFound(true)
                return
            }
            
            const lat = data.coord.lat
            const lon = data.coord.lon

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`

            // Type Guards
            /*const {data: weatherResult} = await axios.get(weatherUrl)
            const reult = isWeatherResponse(weatherResult)
            if(result) {
                console.log(weatherResult.name)
            } else {
                console.log('Respuesta mal formada')
            }*/

            // Zod
            const {data: weatherResult} = await axios(weatherUrl)
            const result = Weather.safeParse(weatherResult)
            if(result.success) {
                setWeather(result.data)
            } else {
                console.log('Respuesta mal formada')
            }

            // Valibot
            /*const {data: weatherResult} = await axios(weatherUrl)
            const result = parse(WeatherScehma, weatherResult)
            if(result) {
                console.log(result.name)
            }*/

        } catch (error) {
            console.log(error)
        }
    }

    const hasWeatherData = useMemo(() => weather.name , [weather])

    return {
        weather,
        notFound,
        fetchWeather,
        hasWeatherData
    }
}
