package com.etravel.code

import com.typesafe.scalalogging.Logger

import scala.collection.mutable.ListBuffer
import scala.io.Source

/**
  * Created by trapatsas on 1/11/2016.
  */
object Scorer extends App {

  def scoring(folderName: String): Unit = {

    val logger = Logger("scoring")

    val professionals = s"/home/trapatsas/samples/$folderName/in/professionals.csv"
    val companies = s"/home/trapatsas/samples/$folderName/in/companies.csv"
    val matches = s"/home/trapatsas/samples/$folderName/out/hirings.csv"

    val prosPrefer: Map[String, Array[String]] = Source.fromFile(professionals).getLines.map(line =>
      line.split(":").head.trim -> line.split(":").last.split(",").map(_.trim)).toMap

    val comsPrefer: Map[(Int, String), Array[String]] = Source.fromFile(companies).getLines.map(line =>
      (line.split(":").head.split(",").head.trim.toInt, line.split(":").head.split(",").last.trim) ->
        line.split(":").last.split(",").map(_.trim)
    ).toMap

    val matchResults = Source.fromFile(matches).getLines.toList

    val tempList = comsPrefer.map(m => m._1._2 -> m._2)

    val allPros = prosPrefer.keys.toList

    val allComs: List[String] = comsPrefer.keys.map(_._2).toList

    val marriage: Map[String, Array[String]] = matchResults.map(_.split(":")).map(a =>
      a.head.trim -> a.last.split(",").map(_.trim)).toMap

    val invertedResults: Map[String, String] = marriage.flatMap(m => m._2.map(p => p -> m._1))

    val proCount = invertedResults.size

    implicit class Crossable[X](xs: Traversable[X]) {
      def cross[Y](ys: Traversable[Y]): Traversable[(X, Y)] = for {x <- xs; y <- ys} yield (x, y)
    }

    var errors: ListBuffer[Array[String]] = new ListBuffer[Array[String]]

    logger.info("Start Scoring")

    val cartesianProduct: Traversable[(String, String)] = allPros cross allComs

    def preferredPrecedesCurrent(indxs: Array[Int], cLst: Array[String], p: String): Boolean = {
      indxs.exists(cLst.indexOf(p) < _)
    }

    def findMismatch(pr: String, cm: String, currentHire: Array[String]) = {
      val proPrefers: Array[String] = prosPrefer(pr)
      val idxHire = proPrefers.indexOf(invertedResults(pr))
      val idxCurrent = proPrefers.indexOf(cm)
      if (idxCurrent < idxHire) {
        val comPrefList: Array[String] = tempList(cm)
        val employerIndices: Array[Int] = currentHire.map(empl => comPrefList.indexOf(empl))
        if (preferredPrecedesCurrent(employerIndices, comPrefList, pr)) {
          errors += Array(pr, cm, invertedResults(pr))
          logger.debug(s"$cm prefers $pr more than at least one of its current employers AND $pr prefers $cm more" +
            s" than company ${invertedResults(pr)} that she currently works for")
        }
      }

    }

    for ((pr, cm) <- cartesianProduct) {
      val currentHire: Array[String] = marriage(cm)
      if (!currentHire.contains(pr)) {
        findMismatch(pr, cm, currentHire)
      }
    }

    logger.info(s"$folderName: ${errors.length.toString}")
    logger.info(s"Pros count: $proCount")
  }

  val folderArray = Array(
    "TEST_2k_01", "TEST_2k_02", "TEST_2k_03", "TEST_2k_04", "TEST_2k_05",
    "TEST_400_01", "TEST_400_02", "TEST_400_03", "TEST_400_04", "TEST_400_05"
  )

  folderArray foreach (fn => scoring(fn))

}
