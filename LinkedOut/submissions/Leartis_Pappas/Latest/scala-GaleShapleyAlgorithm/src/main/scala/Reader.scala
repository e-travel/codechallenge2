package ScalaGaleShapley

import java.io.{File, RandomAccessFile}
import java.nio.channels.FileChannel
import java.util.StringTokenizer;

import scala.collection.mutable
import scala.io.Source
import scala.collection.mutable.HashMap

class Reader(val companiesFilename: String, val professionalsFilename: String) {
  def readCompanies(): HashMap[String, Company] = {
    val companies = new HashMap[String, Company]

    val bufferedSource = Source.fromFile(companiesFilename)
    for (line <- bufferedSource.getLines) {
      var tokenizer = new StringTokenizer(line, ",\\ :")

      val slots = tokenizer.nextToken()
      val companyName = tokenizer.nextToken()

      var preferencesMap = mutable.LinkedHashMap[String, Int]()
      var newCompany = new Company(companyName, preferencesMap, slots.toInt)

      var rank = 1
      while(tokenizer.hasMoreTokens) {
        var personPreference = tokenizer.nextToken()
        newCompany.preferences(personPreference) = rank
        rank += 1
      }
      companies(companyName) = newCompany
    }
    bufferedSource.close
    companies
  }

  def readProfessionals(): HashMap[String, Person] = {
    val professionals = new HashMap[String, Person]

    val source = Source.fromFile(professionalsFilename)
    for(line <- source.getLines) {
      var tokenizer = new StringTokenizer(line, ",\\ :")

      var personName = tokenizer.nextToken()

      var preferencesMap = mutable.LinkedHashMap[String, Int]()
      var newPerson = new Person(personName, preferencesMap)
      var rank = 1

      while(tokenizer.hasMoreTokens) {
        var companyPreference = tokenizer.nextToken()
        newPerson.preferences(companyPreference) = rank
        rank += 1
      }
      professionals(personName) = newPerson
    }

    professionals
  }

  // Memmory Map
  def fillProfessionals(professionals: mutable.HashMap[String, Person]) = {
    val file1 = new File(companiesFilename)
    // Get file channel in readonly mode
    //Get direct byte buffer access using channel.map() operation
    var fileChannel = new RandomAccessFile(file1, "r").getChannel()
    var buffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, 0, fileChannel.size())
    println(buffer.getClass())


    // You can read the file from this buffer the way you like.
    //  for (int i = 0; i < buffer.limit(); i++)
    //  {
    //    System.out.print((char) buffer.get()); //Print the content of file
    //  }
  }
  def fillCompanies(companies: mutable.HashMap[String, Company]) = {
  }
}
