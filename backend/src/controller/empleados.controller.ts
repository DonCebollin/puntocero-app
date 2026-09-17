import { Request, Response  } from "express";
import jwt from "jsonwebtoken";
import * as EmpleadoModel from "../models/Empleado";
import { registroSchema, loginSchema } from "../validations/empleado.validation";
import { no } from "zod/locales";

const JWT_SECRET = process.env.JWT_SECRET || "clave_por_defecto_insegura";

export const empleadoController = {
    async registrar(req: Request, res: Response) {
        const resultado = registroSchema.safeParse(req.body);
        if(!resultado.success) {
            return res.status(400).json({ error: resultado.error.issues});
        }

        try {
            const { nombre, usuario, password, rol } = resultado.data;

            const yaExiste = await EmpleadoModel.existeUsuario(usuario);
            if(yaExiste) {
                return res.status(409).json({ error: `El usuario "${usuario}" ya existe. `});
            }

            const id = await EmpleadoModel.crearEmpleado(nombre, usuario, password, rol);
            res.status(201).json({ id, nombre, usuario, rol});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al registar empleado"});
        }
    },

    async login(req: Request, res: Response) {
        const resultado = loginSchema.safeParse(req.body);
        if(!resultado.success){
            return res.status(400).json({ error: resultado.error.issues});
        }

        try{
            const { usuario, password } = resultado.data;

            const empleado = await EmpleadoModel.obtenerEmpleadoPorUsuarioConHash(usuario);
            if(!empleado){
                return res.status(401).json({ error: "Usuario o contraseña incorrectos"});
            }

            const token = jwt.sign(
                {id: empleado.id, usuario: empleado.usuario, rol: empleado.rol },
                JWT_SECRET,
                {expiresIn: "12h"}
            );

            res.json({
                token,
                empleado: { id: empleado.id, nombre: empleado.nombre, usuario: empleado.usuario, rol: empleado.rol},
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Error al iniciar sesion"});
        }
    },
};