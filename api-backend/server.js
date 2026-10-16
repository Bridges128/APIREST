const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;
const pool = new Pool({
    host: process.env.DB_HOST || 'mi-db',
    user: 'postgres',
    password: 'postgres',
    database: 'tareasdb',
    port: 5432
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

async function iniciarDB() {
    for (let intento = 1; intento <= 10; intento++) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS tareas (
                    id SERIAL PRIMARY KEY,
                    texto TEXT NOT NULL
                )
            `);

            const resultado = await pool.query('SELECT COUNT(*) FROM tareas');
            if (Number(resultado.rows[0].count) === 0) {
                await pool.query(
                    'INSERT INTO tareas (texto) VALUES ($1), ($2), ($3)',
                    [
                        'Aprender conceptos básicos de Docker',
                        'Desplegar mi primer arquitectura de Microservicios',
                        'Tarea 3: Revisar código de David Puentes López'
                    ]
                );
            }

            console.log('Conectado a PostgreSQL y tabla lista');
            return;
        } catch (error) {
            console.log(`Esperando a la base de datos... intento ${intento}`);
            if (intento === 10) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

app.get('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tareas ORDER BY id');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las tareas' });
    }
});

app.post('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query(
            'INSERT INTO tareas (texto) VALUES ($1) RETURNING *',
            [req.body.texto]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        res.status(500).json({ mensaje: 'Error al crear la tarea' });
    }
});

// [DELETE] Vaciar toda la lista (RETO CALIFICABLE - Entregable 3)
app.delete('/api/tareas/limpiar', async (req, res) => {
    try {
        await pool.query('DELETE FROM tareas');
        res.json({ mensaje: 'Lista de tareas vaciada completamente' });
    } catch (error) {
        console.error('Error al vaciar la lista de tareas:', error);
        res.status(500).json({ mensaje: 'Error al vaciar la lista de tareas' });
    }
});

app.delete('/api/tareas/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM tareas WHERE id = $1', [req.params.id]);
        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ mensaje: 'Error al eliminar la tarea' });
    }
});

iniciarDB()
    .then(() => {
        app.listen(PORT, () => console.log(`API REST corriendo en el puerto ${PORT}`));
    })
    .catch(error => {
        console.error('No se pudo inicializar la base de datos:', error);
        process.exit(1);
    });
