+++
title = "TomEE Maven Plugin"
weight = 8
+++

Le plugin Maven TomEE permet de gérer un serveur Apache TomEE directement depuis votre projet Maven, sans avoir besoin d’installer TomEE manuellement. Il peut télécharger, déployer, exécuter et arrêter une instance TomEE via votre configuration Maven.

## Ajouter le plugin dans pom.xml

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomee.maven</groupId>
            <artifactId>tomee-maven-plugin</artifactId>
            <version>10.0.0</version>
            <configuration>
                <tomeeVersion>10.0.0</tomeeVersion>
                <tomeeClassifier>plus</tomeeClassifier>
                <inlinedServerXml>
                    <Server port="8005" shutdown="SHUTDOWN">
                        <Listener
                            className="org.apache.tomee.catalina.ServerListener" />
                        <Listener
                            className="org.apache.catalina.startup.VersionLoggerListener" />
                        <Service name="Catalina">
                            <Connector port="8080" protocol="HTTP/1.1" />
                            <Engine name="Catalina" defaultHost="localhost">
                                <Host name="localhost" appBase="webapps"
                                    unpackWARs="true" autoDeploy="true">
                                </Host>
                            </Engine>
                        </Service>
                    </Server>
                </inlinedServerXml>
            </configuration>
        </plugin>
    </plugins>
</build>
```

Une fois le plugin ajouté, vous pouvez utiliser les commandes suivantes `mvn tomee:run`

```
[INFO] Installed '/Users/adriencaubel/Documents/projects/workspace-iut-mvc2/R601-TP-celsius-fahrenheit/target/R601-TP-celsius-fahrenheit-1.0-SNAPSHOT.war' 
       in /Users/adriencaubel/Documents/projects/workspace-iut-mvc2/R601-TP-celsius-fahrenheit/target/apache-tomee/webapps/R601-TP-celsius-fahrenheit-1.0-SNAPSHOT.war

```

Accéder au serveur en récupérant le nom de l'applicatif `R601-TP-celsius-fahrenheit-1.0-SNAPSHOT` http://localhost:8080/R601-TP-celsius-fahrenheit-1.0-SNAPSHOT