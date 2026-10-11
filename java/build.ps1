$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location "C:\Users\hengx\Desktop\code\财务小管家\java"
& "C:\Users\hengx\Downloads\apache-maven-3.9.5\bin\mvn.cmd" clean package -DskipTests
