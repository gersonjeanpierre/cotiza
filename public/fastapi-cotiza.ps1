# Este script de PowerShell navega a tu proyecto y ejecuta los comandos de Bash.

# Define la ruta de tu proyecto.
$projectPath = "C:/Users/Dev/Projects/fastapi/laser_cotizacion"
$poetryPath = "C:\Users\Dev\scoop\shims\poetry.exe"
# Navega al directorio del proyecto.
# El comando 'Set-Location' (o su alias 'cd') cambia el directorio de trabajo.
Set-Location -Path $projectPath


# Navega al directorio del proyecto.
Set-Location -Path $projectPath

# Ejecuta el servidor de desarrollo de FastAPI usando la ruta completa a poetry.
& "$poetryPath" run fastapi dev .\src\main.py