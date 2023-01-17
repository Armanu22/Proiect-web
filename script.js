const express = require('express');
const Sequelize = require('sequelize')

// conectare sqlite folosind package-ul sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'cars.db'
})

// cream structura tabelelor din baza de date
const Cars = sequelize.define('Cars', {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Model: Sequelize.STRING,
    Price: Sequelize.INTEGER,
    Capacity: Sequelize.INTEGER,
    Year: Sequelize.NUMBER
}, { timestamps: false })

// event care ne arata cand au fost create tablele
sequelize.sync({ alter: true })
    .then(() => {
        console.log('tables created')
    })

const app = express()
const port = 3000

app.use((req, res, next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

// listam pagina html
app.use(express.static('public'))
app.use(express.json())

// aceasta ruta este folosita pentru a lua toate produsele din baza de date
app.get('/cars', async (req, res, next) => {
    try {
        const cars = await Cars.findAll()
        res.status(200).json(cars)
    } catch (error) {
        next(error)
    }
})

// aceasta ruta este folosita pentru a lua datele unui produs anume in functie de id-ul pe care il are
app.get('/car/:id', async (req, res, next) => {
    try {
        const car = await Cars.findByPk(req.params.id)
        res.status(200).json(car)
    } catch (error) {
        next(error)
    }
})

// aceasta ruta este folosita pentru a sterge produsul specificat in parametrii path-ului
app.delete('/car/:id', async (req, res, next) => {
    try {
        const car = await Cars.findByPk(req.params.id)
        if (car) {
            await car.destroy()
            res.status(202).send({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (error) {
        next(error)
    }
})

// aceasta ruta este folosita pentru a creea un nou produs in baza noastra de date
app.post('/cars', async (req, res, next) => {
    try {
        const car = await Cars.create(req.body)
        res.status(201).json(car)
    } catch (error) {
        next(error)
    }
})

// aceasta ruta este folosita pentru a modifica un produs in functie de id-ul care este pus la parametrii path-ului
app.put('/cars/:id', async (req, res, next) => {
    try {
        const car = await Cars.findByPk(req.params.id)
        if (car) {
            // res.json(req.body)
            car.Model = req.body.Model
            car.Price = req.body.Price
            car.Capacity = req.body.Capacity
            car.Year = req.body.Year
            await car.save()
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (error) {
        next(error)
    }
})

// debuging
app.use((err, req, res, next) => {
    console.warn(err)
    res.status(500).json({ message: 'server error' })
})

// pornim aplicatia cu port-ul specificat in variabila de mai sus
app.listen(port)