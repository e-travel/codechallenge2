package com.etravel.code

import java.io.{BufferedWriter, FileOutputStream, OutputStreamWriter}
import java.nio.file.{Files, Paths}

import scala.annotation.tailrec
import scala.util.Random

/**
  * Created by trapatsas on 4/12/2016.
  */
object DataGeneratorRand extends App {

  val exportFolder = "TEST_1k_01"

  val coms = 1000

  val pros = 8

  val professionals = s"/home/trapatsas/samples/$exportFolder/in/"
  val companies = s"/home/trapatsas/samples/$exportFolder/in/"
  val matches = s"/home/trapatsas/samples/$exportFolder/out/"

  val paths = Array(professionals, companies, matches)

  paths.foreach(p => {
    val path = Paths.get(p)
    Files.createDirectories(path)
  })

  val comRange = 1 to coms

  val proRange = Random.shuffle((1 to pros).toList)

  val comList: Seq[String] = comRange.map(c => f"COM_$c%05d")

  val proList: List[String] = proRange.map(c => f"PRO_$c%05d")

  def splitRandChunks[T](list: List[T], chunks: Int): List[List[T]] = {
    // Tail recursion
    @tailrec
    def splitInner[Y](list: List[Y], chunks: Int, size: Int, result: List[List[Y]]): List[List[Y]] =
      if (chunks == 0) result
      else if (chunks == 1) list +: result
      else {
        val avg = size / chunks
        val rand = (1.0 + Random.nextGaussian / 3) * avg
        val index = (rand.toInt max 1) min (size - chunks)
        val (h, t) = list splitAt index
        splitInner(t, chunks - 1, size - index, h +: result)
      }
    splitInner(list, chunks, list.size, Nil).reverse
  }

  val tempGroups: List[List[String]] = splitRandChunks(proList, coms)

  val matchResults: Seq[(String, List[String])] = comList.zip(tempGroups).map(m => m._1 -> m._2)

  val comPrefers: Seq[((Int, String), List[String])] = comList.zip(tempGroups).map(
    m => (m._2.size, m._1) -> Random.shuffle(proList)
  )

  val proPrefers: Seq[(String, Seq[String])] = proList.map(_ -> Random.shuffle(comList))

  val writerCom = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(companies + "companies.csv")))
  for (x <- comPrefers) {
    writerCom.write(s"${x._1._1}, ${x._1._2}: ${x._2.mkString(",")} \n") // however you want to format it
  }
  writerCom.close()

  val writerPro = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(professionals + "professionals.csv")))
  for (x <- proPrefers) {
    writerPro.write(s"${x._1}: ${x._2.mkString(",")} \n") // however you want to format it
  }
  writerPro.close()

  println("Files created.")

}
