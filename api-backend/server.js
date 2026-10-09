const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); 

// MIDDLEWARE PARA IMPRIMIR LOGS EN CONSOLA (Clave para el Entregable 2)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Simulación de Base de Datos en memoria (Entregable 1)
let tareas = [
    { id: 1, texto: "Aprender conceptos básicos de Docker" },
    { id: 2, texto: "Desplegar mi primer arquitectura de Microservicios" },
    { id: 3, texto: "Tarea 3: Revisar código de David Puentes López" }
];

// [GET] Obtener la lista completa de tareas
app.get('/api/tareas', (req, res) => {
    res.json(tareas);
});

// [POST] Crear una nueva tarea
app.post('/api/tareas', (req, res) => {
    const nuevaTarea = { id: Date.now(), texto: req.body.texto };
    tareas.push(nuevaTarea);
    res.status(201).json(nuevaTarea);
});

// [DELETE] Vaciar toda la lista (RETO CALIFICABLE - Entregable 3)
app.delete('/api/tareas/limpiar', (req, res) => {
    tareas = [];
    res.json({ mensaje: "Lista de tareas vaciada completamente" });
});

// [DELETE] Eliminar una tarea específica mediante su ID en la URL
app.delete('/api/tareas/:id', (req, res) => {
    const idEliminar = parseInt(req.params.id);
    tareas = tareas.filter(t => t.id !== idEliminar);
    res.json({ mensaje: "Tarea eliminada correctamente" });
});

app.listen(PORT, () => console.log(`API REST corriendo en el puerto ${PORT}`));