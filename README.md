# Rotten Apples - V1
Aplicación Web que tiene como objetivo que los usuarios registrados puedan publicar las reviews de las películas que vieron.
Aparte, los usuarios con privilegios de administrador van a poder agregar nuevas películas al listado, y eliminar usuarios (no administradores), reviews y las películas que les parezca indicado.

# Tecnologías Utilizadas
HTML / CSS / Bootstrap / AngularJs / PHP / MySQL / LocalStorage / JWT / Consumo de API REST

# Información General
'''
El usuario va a poder registrarse e iniciar sesión.
El usuario va a poder publicar sus reviews personales de las películas vio.
El usuario va a poder ver todas las reviews.
El usuario va a poder eliminar y modificar las reviews que publico.

Los administradores van a poder hacer lo mismo que usuario normal.
Los administradores van a poder eliminar todas las películas, usuarios y reviews.
Los administradores van a poder agregar nuevas películas.
Los administradores no van a poder eliminar a otros administradores.
Los administradores no van a poder editar las películas.
Siempre va a tener que quedar al menos una pelicula en la base de datos.

No se van a poder registrar 2 email idénticos.
No se van a poder registrar 2 nombres de usuarios idénticos.
No se puede crear una película que tenga el mismo nombre, que una pelícua ya registrada.

El listado de las películas se va a obtener a través de la información que se encuentran en la base de datos.

Las contraseñas de todos los usuarios se van a encontrar hasheadas, para resguardar la seguridad de las cuentas de los usuarios.
'''