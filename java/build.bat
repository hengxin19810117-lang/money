@echo off
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "C:\Users\hengx\Desktop\code\财务小管家\java"
call mvn clean package -DskipTests
