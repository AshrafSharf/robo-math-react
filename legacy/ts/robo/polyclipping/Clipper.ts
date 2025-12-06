/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	import Point = away.geom.Point;

	export class Clipper extends ClipperBase
	{
		public static  clipPolygon(subjectPolygonFloat:Point[], clipPolygonFloat:Point[], clipType:number):any
		{			
			var subjectPolygon:Polygon = new Polygon();
			var clipPolygon:Polygon = new Polygon();



			for (var i:number=0;i<subjectPolygonFloat.length;i++)
			{
                // Convert flash.geom.Point arrays into IntPoint vectors
                var point:Point = subjectPolygonFloat[i];
				subjectPolygon.addPoint(new IntPoint(Clipper.float2int(Math.round(point.x)), Clipper.float2int(Math.round(point.y))));			
			}			
			for (var i:number=0;i<clipPolygonFloat.length;i++)
			{
                var point:Point = clipPolygonFloat[i];
				clipPolygon.addPoint(new IntPoint(Clipper.float2int(Math.round(point.x)), Clipper.float2int(Math.round(point.y))));			
			}
			
			var clipper:Clipper = new Clipper();
			clipper.addPolygon(subjectPolygon, PolyType.SUBJECT);
			clipper.addPolygon(clipPolygon, PolyType.CLIP);
			
			var solution:Polygons = new Polygons();
			clipper.execute(clipType, solution, PolyFillType.EVEN_ODD, PolyFillType.EVEN_ODD);
			var ret:any = [];

            var solutionPolys:Polygon[] =  solution.getPolygons();
            for (var index:number=0;index<solutionPolys.length;index++)
			{
                var solutionPoly:Polygon = solutionPolys[index];
    			var n:number = solutionPoly.getSize();
				var points:any = new Array(n);
				for (var i:number = 0; i < n; ++i) 
				{
					var p:IntPoint = solutionPoly.getPoint(i);
					points[i] = new Point(p.X, p.Y);
				}				
				ret.push(points);			
			}


			return ret;		
	
		}







        public static  clipMultiPolygons(subjectPolygons:any, clipPolygons:any, clipType:number):any
		{	
			var clipper:Clipper = new Clipper();
			
			var subjectPolygonFloat:any;

            for(var index:number=0;index<subjectPolygons.length;index++)
            {
                var subjectPolygonFloat = subjectPolygons[index];

                var subjectPolygon:Polygon = new Polygon();

                for(var i:number=0;i<subjectPolygonFloat.length;i++)
                {
                    // Convert flash.geom.Point arrays into IntPoint vectors
                    var point:Point =subjectPolygonFloat[i];
                    subjectPolygon.addPoint(new IntPoint(Clipper.float2int(Math.round(point.x)), Clipper.float2int(Math.round(point.y))));
                }

               clipper.addPolygon(subjectPolygon, PolyType.SUBJECT);
            }

            		var clipPolygonFloat:any;
			
			for( var i:number=0;i<clipPolygons.length;i++)
			{
                clipPolygonFloat  = clipPolygons[i];
                var clipPolygon:Polygon = new Polygon();



				for (var j:number=0;j<clipPolygonFloat.length;j++)
				{
                    // Convert flash.geom.Point arrays into IntPoint vectors
                    var point:Point = clipPolygonFloat[j];
					clipPolygon.addPoint(new IntPoint(Clipper.float2int(Math.round(point.x)), Clipper.float2int(Math.round(point.y))));			
				}	
				
				
				clipper.addPolygon(clipPolygon, PolyType.CLIP);
			}
			
				
			
			
			var solution:Polygons = new Polygons();
			clipper.execute(clipType, solution, PolyFillType.EVEN_ODD, PolyFillType.EVEN_ODD);
			var ret:any = [];
			for (var index:number=0;index<solution.getPolygons().length;index++)
			{
                var solutionPoly:Polygon = solution.getPolygons()[index];
				var n:number = solutionPoly.getSize();
				var points:any = new Array(n);
				for (var i:number = 0; i < n; ++i) 
				{
					var p:IntPoint = solutionPoly.getPoint(i);
					points[i] = new Point(p.X, p.Y);
				}				
				ret.push(points);			
			}			
			return ret;		
			
		}

		private  m_PolyOuts:OutRec[];
		private  m_ClipType:number; //ClipType
		private  m_Scanbeam:Scanbeam;
		private  m_ActiveEdges:TEdge;
		private  m_SortedEdges:TEdge;
		private  m_IntersectNodes:IntersectNode;
		private  m_ExecuteLocked:Boolean;
		private  m_ClipFillType:number; //PolyFillType
		private  m_SubjFillType:number; //PolyFillType
		private  m_Joins:JoinRec[];
		private  m_HorizJoins:HorzJoinRec[];
		private  m_ReverseOutput:Boolean;

		constructor()
		{
            super();
			this.m_Scanbeam = null;
			this.m_ActiveEdges = null;
			this.m_SortedEdges = null;
			this.m_IntersectNodes = null;
			this.m_ExecuteLocked = false;
			this.m_PolyOuts = [];
			this.m_Joins = [];
			this.m_HorizJoins = [];
			this.m_ReverseOutput = false;
		}
		//------------------------------------------------------------------------------

		 public  clear():void
		{
			if (this.m_edges.length == 0) return; //avoids problems with ClipperBase destructor
			this.disposeAllPolyPts();
			super.clear();
		}
		//------------------------------------------------------------------------------

		private  disposeScanbeamList():void
		{
			while ( this.m_Scanbeam != null ) 
			{
				var sb2:Scanbeam = this.m_Scanbeam.next;
				this.m_Scanbeam = null;
				this.m_Scanbeam = sb2;
			}
		}
		//------------------------------------------------------------------------------

		   reset() : void 
		{
			super.reset();
			this.m_Scanbeam = null;
			this.m_ActiveEdges = null;
			this.m_SortedEdges = null;
			this.disposeAllPolyPts();
			var lm:LocalMinima = this.m_MinimaList;
			while (lm != null)
			{
				this.insertScanbeam(lm.Y);
				this.insertScanbeam(lm.leftBound.ytop);
				lm = lm.next;
			}
		}
		//------------------------------------------------------------------------------

		public  setReverseSolution(reverse:Boolean):void
		{
			this.m_ReverseOutput = reverse;
		}
		//------------------------------------------------------------------------------
		
		public  getReverseSolution():Boolean
		{
			return this.m_ReverseOutput;
		}
		//------------------------------------------------------------------------------        
		
		private  insertScanbeam(Y:number):void
		{
			if (this.m_Scanbeam == null)
			{
				this.m_Scanbeam = new Scanbeam();
				this.m_Scanbeam.next = null;
				this.m_Scanbeam.Y = Y;
			}
			else if (Y > this.m_Scanbeam.Y)
			{
				var newSb:Scanbeam = new Scanbeam();
				newSb.Y = Y;
				newSb.next = this.m_Scanbeam;
				this.m_Scanbeam = newSb;
			} 
			else
			{
				var sb2:Scanbeam = this.m_Scanbeam;
				while( sb2.next != null  && ( Y <= sb2.next.Y ) ) sb2 = sb2.next;
				if(  Y == sb2.Y ) return; //ie ignores duplicates
				newSb = new Scanbeam();
				newSb.Y = Y;
				newSb.next = sb2.next;
				sb2.next = newSb;
			}
		}
		//------------------------------------------------------------------------------

		public  execute(
			clipType:number,//ClipType
			solution:Polygons,
			subjFillType:number,//PolyFillType 
			clipFillType:number //PolyFillType 
			):Boolean
		{
			if (this.m_ExecuteLocked) return false;
			this.m_ExecuteLocked = true;
			solution.clear();
			this.m_SubjFillType = subjFillType;
			this.m_ClipFillType = clipFillType;
			this.m_ClipType = clipType;
			var succeeded:Boolean = this.executeInternal(false);
			//build the return polygons ...
			if (succeeded) this.buildResult(solution);
			this.m_ExecuteLocked = false;
			return succeeded;
		}
		//------------------------------------------------------------------------------
/*
		public bool Execute(ClipType clipType, ExPolygons solution,
			PolyFillType subjFillType, PolyFillType clipFillType)
		{
			if (this.m_ExecuteLocked) return false;
			this.m_ExecuteLocked = true;
			solution.Clear();
			this.m_SubjFillType = subjFillType;
			this.m_ClipFillType = clipFillType;
			this.m_ClipType = clipType;
			bool succeeded = ExecuteInternal(true);
			//build the return polygons ...
			if (succeeded) BuildResultEx(solution);
			this.m_ExecuteLocked = false;
			return succeeded;
		}
		//------------------------------------------------------------------------------

		public bool Execute(ClipType clipType, Polygons solution)
		{
			return Execute(clipType, solution,
				PolyFillType.pftEvenOdd, PolyFillType.pftEvenOdd);
		}
		//------------------------------------------------------------------------------

		public bool Execute(ClipType clipType, ExPolygons solution)
		{
			return Execute(clipType, solution,
				PolyFillType.pftEvenOdd, PolyFillType.pftEvenOdd);
		}
		//------------------------------------------------------------------------------

		//------------------------------------------------------------------------------
*/
		  findAppendLinkEnd(outRec:OutRec):OutRec 
		{
			while (outRec.appendLink != null) outRec = outRec.appendLink;
			return outRec;
		}
		//------------------------------------------------------------------------------

		  fixHoleLinkage(outRec:OutRec):void
		{
			var tmp:OutRec;
			if (outRec.bottomPt != null) 
				tmp = this.m_PolyOuts[outRec.bottomPt.idx].firstLeft; 
			else
				tmp = outRec.firstLeft;
			if (outRec == tmp) throw new ClipperException("HoleLinkage error");

			if (tmp != null) 
			{
				if (tmp.appendLink != null) tmp = this.findAppendLinkEnd(tmp);

				if (tmp == outRec) tmp = null;
				else if (tmp.isHole)
				{
					this.fixHoleLinkage(tmp);
					tmp = tmp.firstLeft;
				}
			}
			outRec.firstLeft = tmp;
			if (tmp == null) outRec.isHole = false;
			outRec.appendLink = null;
		}
		//------------------------------------------------------------------------------
		
		private  executeInternal(fixHoleLinkages:Boolean):Boolean
		{
			var succeeded:Boolean;
			try
			{
				this.reset();
				if (this.m_CurrentLM == null) return true;
				var botY:number = this.popScanbeam();
				do
				{
                    this.insertLocalMinimaIntoAEL(botY);
					this.m_HorizJoins.length = 0; //clear;
                    this.processHorizontals();
					var topY:number = this.popScanbeam();
					succeeded = this.processIntersections(botY, topY);
					if (!succeeded) break;
                    this.processEdgesAtTopOfScanbeam(topY);
					botY = topY;
				} while (this.m_Scanbeam != null);
			}
			catch (err)
			{ 
				succeeded = false; 
			}

			if (succeeded)
			{ 
				//tidy up output polygons and fix orientations where necessary ...
				for  (var i:number=0;i<this.m_PolyOuts.length;i++)
				{
                    var outRec:OutRec = this.m_PolyOuts[i];
					if (outRec.pts == null) continue;
                    this.fixupOutPolygon(outRec);
					if (outRec.pts == null) continue;
					if (outRec.isHole && fixHoleLinkages) this.fixHoleLinkage(outRec);

					if (outRec.bottomPt == outRec.bottomFlag &&
						(this.orientationOutRec(outRec, this.m_UseFullRange) != (this.areaOutRec(outRec, this.m_UseFullRange) > 0)))
					{
                        this.disposeBottomPt(outRec);
					}

					if (outRec.isHole == Clipper.xor(this.m_ReverseOutput, this.orientationOutRec(outRec, this.m_UseFullRange)))
					{
                        this.reversePolyPtLinks(outRec.pts);
					}
				}

                this.joinCommonEdges(fixHoleLinkages);
				if (fixHoleLinkages) this.m_PolyOuts.sort(Clipper.polySort);
			}
			this.m_Joins.length = 0; // clear
			this.m_HorizJoins.length = 0; // clear
			return succeeded;
		}
		//------------------------------------------------------------------------------

		private static  polySort(or1:OutRec, or2:OutRec):number
		{
			if (or1 == or2)
			{
				return 0;
			}
			else if (or1.pts == null || or2.pts == null)
			{
				if ((or1.pts == null) != (or2.pts == null))
				{
					return or1.pts == null ? 1 : -1;
				}
				else return 0;          
			}
			
			var i1:number, i2:number;
			if (or1.isHole)
				i1 = or1.firstLeft.idx; 
			else
				i1 = or1.idx;
				
			if (or2.isHole)
				i2 = or2.firstLeft.idx; 
			else
				i2 = or2.idx;
				
			var result:number = i1 - i2;
			if (result == 0 && (or1.isHole != or2.isHole))
			{
				return or1.isHole ? 1 : -1;
			}
			return result;
		}
		//------------------------------------------------------------------------------
		
		private  popScanbeam():number
		{
			var Y:number = this.m_Scanbeam.Y;
			var sb2:Scanbeam = this.m_Scanbeam;
			this.m_Scanbeam = this.m_Scanbeam.next;
			sb2 = null;
			return Y;
		}
		//------------------------------------------------------------------------------
		
		private  disposeAllPolyPts():void
		{
		  for (var i:number = 0; i < this.m_PolyOuts.length; ++i) this.disposeOutRec(i);
		  this.m_PolyOuts.length = 0;
		}
		//------------------------------------------------------------------------------

		private  disposeBottomPt(outRec:OutRec):void
		{
			var next:OutPt = outRec.bottomPt.next;
			var prev:OutPt = outRec.bottomPt.prev;
			if (outRec.pts == outRec.bottomPt) outRec.pts = next;
			outRec.bottomPt = null;
			next.prev = prev;
			prev.next = next;
			outRec.bottomPt = next;
            this.fixupOutPolygon(outRec);
		}
		//------------------------------------------------------------------------------

		private  disposeOutRec(index:number):void
		{
		  var outRec:OutRec = this.m_PolyOuts[index];
		  if (outRec.pts != null) this.disposeOutPts(outRec.pts);
		  outRec = null;
		  this.m_PolyOuts[index] = null;
		}
		//------------------------------------------------------------------------------

		private  disposeOutPts(pp:OutPt):void
		{
			if (pp == null) return;
			var tmpPp:OutPt = null;
			pp.prev.next = null;
			while (pp != null)
			{
				tmpPp = pp;
				pp = pp.next;
				tmpPp = null;
			}
		}
		//------------------------------------------------------------------------------

		private  addJoin(e1:TEdge, e2:TEdge, e1OutIdx:number, e2OutIdx:number):void
		{
			var jr:JoinRec = new JoinRec();
			if (e1OutIdx >= 0)
				jr.poly1Idx = e1OutIdx; else
			jr.poly1Idx = e1.outIdx;
			jr.pt1a = new IntPoint(e1.xcurr, e1.ycurr);
			jr.pt1b = new IntPoint(e1.xtop, e1.ytop);
			if (e2OutIdx >= 0)
				jr.poly2Idx = e2OutIdx; else
				jr.poly2Idx = e2.outIdx;
			jr.pt2a = new IntPoint(e2.xcurr, e2.ycurr);
			jr.pt2b = new IntPoint(e2.xtop, e2.ytop);
			this.m_Joins.push(jr);
		}
		//------------------------------------------------------------------------------

		private  addHorzJoin(e:TEdge, idx:number):void
		{
			var hj:HorzJoinRec = new HorzJoinRec();
			hj.edge = e;
			hj.savedIdx = idx;
			this.m_HorizJoins.push(hj);
		}
		//------------------------------------------------------------------------------

		private  insertLocalMinimaIntoAEL(botY:number):void
		{
			while(  this.m_CurrentLM != null  && ( this.m_CurrentLM.Y == botY ) )
			{
				var lb:TEdge = this.m_CurrentLM.leftBound;
				var rb:TEdge = this.m_CurrentLM.rightBound;

                this.insertEdgeIntoAEL( lb );
                this.insertScanbeam( lb.ytop );
                this.insertEdgeIntoAEL( rb );

				if (this.isEvenOddFillType(lb))
				{
					lb.windDelta = 1;
					rb.windDelta = 1;
				}
				else
				{
					rb.windDelta = -lb.windDelta;
				}
                this.setWindingCount(lb);
				rb.windCnt = lb.windCnt;
				rb.windCnt2 = lb.windCnt2;

				if(  rb.dx == ClipperBase.horizontal )
				{
					//nb: only rightbounds can have a ClipperBase.horizontal bottom edge
                    this.addEdgeToSEL( rb );
                    this.insertScanbeam( rb.nextInLML.ytop );
				}
				else
                    this.insertScanbeam( rb.ytop );

				if( this.isContributing(lb) )
                    this.addLocalMinPoly(lb, rb, new IntPoint(lb.xcurr, this.m_CurrentLM.Y));

				//if any output polygons share an edge, they'll need joining later ...
				if (rb.outIdx >= 0)
				{
					if (rb.dx == ClipperBase.horizontal)
					{
						for (var i:number = 0; i < this.m_HorizJoins.length; i++)
						{
							var hj:HorzJoinRec = this.m_HorizJoins[i];
							//if horizontals rb and hj.edge overlap, flag for joining later ...
							var pt1a:IntPoint = new IntPoint(hj.edge.xbot, hj.edge.ybot);
							var pt1b:IntPoint = new IntPoint(hj.edge.xtop, hj.edge.ytop);
							var pt2a:IntPoint =	new IntPoint(rb.xbot, rb.ybot);
							var pt2b:IntPoint =	new IntPoint(rb.xtop, rb.ytop); 
							if (this.getOverlapSegment(new Segment(pt1a, pt1b), new Segment(pt2a, pt2b), new Segment(null, null)))
							{
                                this.addJoin(hj.edge, rb, hj.savedIdx, -1);
							}
						}
					}
				}


				if( lb.nextInAEL != rb )
				{
					if (rb.outIdx >= 0 && rb.prevInAEL.outIdx >= 0 &&
                        this.slopesEqual(rb.prevInAEL, rb, this.m_UseFullRange))
					{
                        this.addJoin(rb, rb.prevInAEL, -1, -1);
					}
					var e:TEdge = lb.nextInAEL;
					var pt:IntPoint = new IntPoint(lb.xcurr, lb.ycurr);
					while( e != rb )
					{
						if(e == null) 
							throw new ClipperException("InsertLocalMinimaIntoAEL: missing rightbound!");
						//nb: For calculating winding counts etc, IntersectEdges() assumes
						//that param1 will be to the right of param2 ABOVE the intersection ...
                        this.intersectEdges( rb , e , pt , Protects.NONE); //order important here
						e = e.nextInAEL;
					}
				}
                this.popLocalMinima();
			}
		}
		//------------------------------------------------------------------------------

		private  insertEdgeIntoAEL(edge:TEdge):void
		{
			edge.prevInAEL = null;
			edge.nextInAEL = null;
			if (this.m_ActiveEdges == null)
			{
				this.m_ActiveEdges = edge;
			}
			else if( this.E2InsertsBeforeE1(this.m_ActiveEdges, edge) )
			{
				edge.nextInAEL = this.m_ActiveEdges;
				this.m_ActiveEdges.prevInAEL = edge;
				this.m_ActiveEdges = edge;
			} 
			else
			{
				var e:TEdge = this.m_ActiveEdges;
				while (e.nextInAEL != null && !this.E2InsertsBeforeE1(e.nextInAEL, edge))
				  e = e.nextInAEL;
				edge.nextInAEL = e.nextInAEL;
				if (e.nextInAEL != null) e.nextInAEL.prevInAEL = edge;
				edge.prevInAEL = e;
				e.nextInAEL = edge;
			}
		}
		//----------------------------------------------------------------------

		private  E2InsertsBeforeE1(e1:TEdge, e2:TEdge):Boolean
		{
			return e2.xcurr == e1.xcurr? e2.dx > e1.dx : e2.xcurr < e1.xcurr;
		}
		//------------------------------------------------------------------------------

		private  isEvenOddFillType(edge:TEdge):Boolean
		{
		  if (edge.polyType == PolyType.SUBJECT)
			  return this.m_SubjFillType == PolyFillType.EVEN_ODD; 
		  else
			  return this.m_ClipFillType == PolyFillType.EVEN_ODD;
		}
		//------------------------------------------------------------------------------

		private  isEvenOddAltFillType(edge:TEdge):Boolean 
		{
		  if (edge.polyType == PolyType.SUBJECT)
			  return this.m_ClipFillType == PolyFillType.EVEN_ODD; 
		  else
			  return this.m_SubjFillType == PolyFillType.EVEN_ODD;
		}
		//------------------------------------------------------------------------------

		private  isContributing(edge:TEdge):Boolean
		{
			var pft:number, pft2:number; //PolyFillType
			if (edge.polyType == PolyType.SUBJECT)
			{
				pft = this.m_SubjFillType;
				pft2 = this.m_ClipFillType;
			}
			else
			{
				pft = this.m_ClipFillType;
				pft2 = this.m_SubjFillType;
			}

			switch (pft)
			{
				case PolyFillType.EVEN_ODD:
				case PolyFillType.NON_ZERO:
					if (Clipper.abs(edge.windCnt) != 1) return false;
					break;
				case PolyFillType.POSITIVE:
					if (edge.windCnt != 1) return false;
					break;
				default: //PolyFillType.NEGATIVE
					if (edge.windCnt != -1) return false;
					break;
			}

			switch (this.m_ClipType)
			{
				case ClipType.INTERSECTION:
					switch (pft2)
					{
						case PolyFillType.EVEN_ODD:
						case PolyFillType.NON_ZERO:
							return (edge.windCnt2 != 0);
						case PolyFillType.POSITIVE:
							return (edge.windCnt2 > 0);
						default:
							return (edge.windCnt2 < 0);
					}
				case ClipType.UNION:
					switch (pft2)
					{
						case PolyFillType.EVEN_ODD:
						case PolyFillType.NON_ZERO:
							return (edge.windCnt2 == 0);
						case PolyFillType.POSITIVE:
							return (edge.windCnt2 <= 0);
						default:
							return (edge.windCnt2 >= 0);
					}
				case ClipType.DIFFERENCE:
					if (edge.polyType == PolyType.SUBJECT)
						switch (pft2)
						{
							case PolyFillType.EVEN_ODD:
							case PolyFillType.NON_ZERO:
								return (edge.windCnt2 == 0);
							case PolyFillType.POSITIVE:
								return (edge.windCnt2 <= 0);
							default:
								return (edge.windCnt2 >= 0);
						}
					else
						switch (pft2)
						{
							case PolyFillType.EVEN_ODD:
							case PolyFillType.NON_ZERO:
								return (edge.windCnt2 != 0);
							case PolyFillType.POSITIVE:
								return (edge.windCnt2 > 0);
							default:
								return (edge.windCnt2 < 0);
						}
			}
			return true;
		}
		//------------------------------------------------------------------------------

		private  setWindingCount(edge:TEdge):void
		{
			var e:TEdge = edge.prevInAEL;
			//find the edge of the same polytype that immediately preceeds 'edge' in AEL
			while (e != null && e.polyType != edge.polyType)
				e = e.prevInAEL;
			if (e == null)
			{
				edge.windCnt = edge.windDelta;
				edge.windCnt2 = 0;
				e = this.m_ActiveEdges; //ie get ready to calc windCnt2
			}
			else if (this.isEvenOddFillType(edge))
			{
				//even-odd filling ...
				edge.windCnt = 1;
				edge.windCnt2 = e.windCnt2;
				e = e.nextInAEL; //ie get ready to calc windCnt2
			}
			else
			{
				//nonZero filling ...
				if (e.windCnt * e.windDelta < 0)
				{
					if (Clipper.abs(e.windCnt) > 1)
					{
						if (e.windDelta * edge.windDelta < 0)
							edge.windCnt = e.windCnt;
						else
							edge.windCnt = e.windCnt + edge.windDelta;
					}
					else
						edge.windCnt = e.windCnt + e.windDelta + edge.windDelta;
				}
				else
				{
					if (Clipper.abs(e.windCnt) > 1 && e.windDelta * edge.windDelta < 0)
						edge.windCnt = e.windCnt;
					else if (e.windCnt + edge.windDelta == 0)
						edge.windCnt = e.windCnt;
					else
						edge.windCnt = e.windCnt + edge.windDelta;
				}
				edge.windCnt2 = e.windCnt2;
				e = e.nextInAEL; //ie get ready to calc windCnt2
			}

			//update windCnt2 ...
			if (this.isEvenOddAltFillType(edge))
			{
				//even-odd filling ...
				while (e != edge)
				{
					edge.windCnt2 = (edge.windCnt2 == 0) ? 1 : 0;
					e = e.nextInAEL;
				}
			}
			else
			{
				//nonZero filling ...
				while (e != edge)
				{
					edge.windCnt2 += e.windDelta;
					e = e.nextInAEL;
				}
			}
		}
		//------------------------------------------------------------------------------

		private  addEdgeToSEL(edge:TEdge):void
		{
			//SEL pointers in PEdge are reused to build a list of ClipperBase.horizontal edges.
			//However, we don't need to worry about order with ClipperBase.horizontal edge processing.
			if (this.m_SortedEdges == null)
			{
				this.m_SortedEdges = edge;
				edge.prevInSEL = null;
				edge.nextInSEL = null;
			}
			else
			{
				edge.nextInSEL = this.m_SortedEdges;
				edge.prevInSEL = null;
				this.m_SortedEdges.prevInSEL = edge;
				this.m_SortedEdges = edge;
			}
		}
		//------------------------------------------------------------------------------

		private  copyAELToSEL():void
		{
			var e:TEdge = this.m_ActiveEdges;
			this.m_SortedEdges = e;
			if (this.m_ActiveEdges == null)
				return;
			this.m_SortedEdges.prevInSEL = null;
			e = e.nextInAEL;
			while (e != null)
			{
				e.prevInSEL = e.prevInAEL;
				e.prevInSEL.nextInSEL = e;
				e.nextInSEL = null;
				e = e.nextInAEL;
			}
		}
		//------------------------------------------------------------------------------

		private  swapPositionsInAEL(edge1:TEdge, edge2:TEdge):void
		{
			if (edge1.nextInAEL == null && edge1.prevInAEL == null)
				return;
			if (edge2.nextInAEL == null && edge2.prevInAEL == null)
				return;

			if (edge1.nextInAEL == edge2)
			{
				var next:TEdge = edge2.nextInAEL;
				if (next != null)
					next.prevInAEL = edge1;
				var prev:TEdge = edge1.prevInAEL;
				if (prev != null)
					prev.nextInAEL = edge2;
				edge2.prevInAEL = prev;
				edge2.nextInAEL = edge1;
				edge1.prevInAEL = edge2;
				edge1.nextInAEL = next;
			}
			else if (edge2.nextInAEL == edge1)
			{
				next = edge1.nextInAEL;
				if (next != null)
					next.prevInAEL = edge2;
				prev = edge2.prevInAEL;
				if (prev != null)
					prev.nextInAEL = edge1;
				edge1.prevInAEL = prev;
				edge1.nextInAEL = edge2;
				edge2.prevInAEL = edge1;
				edge2.nextInAEL = next;
			}
			else
			{
				next = edge1.nextInAEL;
				prev = edge1.prevInAEL;
				edge1.nextInAEL = edge2.nextInAEL;
				if (edge1.nextInAEL != null)
					edge1.nextInAEL.prevInAEL = edge1;
				edge1.prevInAEL = edge2.prevInAEL;
				if (edge1.prevInAEL != null)
					edge1.prevInAEL.nextInAEL = edge1;
				edge2.nextInAEL = next;
				if (edge2.nextInAEL != null)
					edge2.nextInAEL.prevInAEL = edge2;
				edge2.prevInAEL = prev;
				if (edge2.prevInAEL != null)
					edge2.prevInAEL.nextInAEL = edge2;
			}

			if (edge1.prevInAEL == null)
				this.m_ActiveEdges = edge1;
			else if (edge2.prevInAEL == null)
				this.m_ActiveEdges = edge2;
		}
		//------------------------------------------------------------------------------

		private  swapPositionsInSEL(edge1:TEdge, edge2:TEdge):void
		{
			if (edge1.nextInSEL == null && edge1.prevInSEL == null)
				return;
			if (edge2.nextInSEL == null && edge2.prevInSEL == null)
				return;

			if (edge1.nextInSEL == edge2)
			{
				var next:TEdge = edge2.nextInSEL;
				if (next != null)
					next.prevInSEL = edge1;
				var prev:TEdge = edge1.prevInSEL;
				if (prev != null)
					prev.nextInSEL = edge2;
				edge2.prevInSEL = prev;
				edge2.nextInSEL = edge1;
				edge1.prevInSEL = edge2;
				edge1.nextInSEL = next;
			}
			else if (edge2.nextInSEL == edge1)
			{
				next = edge1.nextInSEL;
				if (next != null)
					next.prevInSEL = edge2;
				prev = edge2.prevInSEL;
				if (prev != null)
					prev.nextInSEL = edge1;
				edge1.prevInSEL = prev;
				edge1.nextInSEL = edge2;
				edge2.prevInSEL = edge1;
				edge2.nextInSEL = next;
			}
			else
			{
				next = edge1.nextInSEL;
				prev = edge1.prevInSEL;
				edge1.nextInSEL = edge2.nextInSEL;
				if (edge1.nextInSEL != null)
					edge1.nextInSEL.prevInSEL = edge1;
				edge1.prevInSEL = edge2.prevInSEL;
				if (edge1.prevInSEL != null)
					edge1.prevInSEL.nextInSEL = edge1;
				edge2.nextInSEL = next;
				if (edge2.nextInSEL != null)
					edge2.nextInSEL.prevInSEL = edge2;
				edge2.prevInSEL = prev;
				if (edge2.prevInSEL != null)
					edge2.prevInSEL.nextInSEL = edge2;
			}

			if (edge1.prevInSEL == null)
				this.m_SortedEdges = edge1;
			else if (edge2.prevInSEL == null)
				this.m_SortedEdges = edge2;
		}
		//------------------------------------------------------------------------------

		private  addLocalMaxPoly(e1:TEdge, e2:TEdge, pt:IntPoint):void
		{
            this.addOutPt(e1, pt);
			if (e1.outIdx == e2.outIdx)
			{
				e1.outIdx = -1;
				e2.outIdx = -1;
			}
			else if (e1.outIdx < e2.outIdx)
                this.appendPolygon(e1, e2);
			else
                this.appendPolygon(e2, e1);
		}
		//------------------------------------------------------------------------------

		private  addLocalMinPoly(e1:TEdge, e2:TEdge, pt:IntPoint):void
		{
			var e:TEdge, prevE:TEdge;
			if (e2.dx == ClipperBase.horizontal || (e1.dx > e2.dx))
			{
                this.addOutPt(e1, pt);
				e2.outIdx = e1.outIdx;
				e1.side = EdgeSide.LEFT;
				e2.side = EdgeSide.RIGHT;
				e = e1;
				if (e.prevInAEL == e2)
				  prevE = e2.prevInAEL;
				else
				  prevE = e.prevInAEL;
			}
			else
			{
                this.addOutPt(e2, pt);
				e1.outIdx = e2.outIdx;
				e1.side = EdgeSide.RIGHT;
				e2.side = EdgeSide.LEFT;
				e = e2;
				if (e.prevInAEL == e1)
					prevE = e1.prevInAEL;
				else
					prevE = e.prevInAEL;
			}

			if (prevE != null && prevE.outIdx >= 0 &&
				(Clipper.topX(prevE, pt.Y) == Clipper.topX(e, pt.Y)) &&
                this.slopesEqual(e, prevE, this.m_UseFullRange))
                this.addJoin(e, prevE, -1, -1);

		}
		//------------------------------------------------------------------------------

		private  createOutRec():OutRec
		{
			var result:OutRec = new OutRec();
			result.idx = -1;
			result.isHole = false;
			result.firstLeft = null;
			result.appendLink = null;
			result.pts = null;
			result.bottomPt = null;
			result.bottomFlag = null;
			result.sides = EdgeSide.NEITHER;
			return result;
		}
		//------------------------------------------------------------------------------

		private  addOutPt(e:TEdge, pt:IntPoint):void
		{
			var toFront:Boolean = (e.side == EdgeSide.LEFT);
			if (e.outIdx < 0)
			{
				var outRec:OutRec = this.createOutRec();
				this.m_PolyOuts.push(outRec);
				outRec.idx = this.m_PolyOuts.length -1;
				e.outIdx = outRec.idx;
				var op:OutPt = new OutPt();
				outRec.pts = op;
				outRec.bottomPt = op;
				op.pt = pt;
				op.idx = outRec.idx;
				op.next = op;
				op.prev = op;
                this.setHoleState(e, outRec);
			}
			else
			{
				outRec = this.m_PolyOuts[e.outIdx];
				op = outRec.pts;
				var op2:OutPt, opBot:OutPt;
				if (toFront && ClipperBase.pointsEqual(pt, op.pt) ||
				  (!toFront && ClipperBase.pointsEqual(pt, op.prev.pt)))
				{
					return;
				}

				if ((e.side | outRec.sides) != outRec.sides)
				{
					//check for 'rounding' artefacts ...
					if (outRec.sides == EdgeSide.NEITHER && pt.Y == op.pt.Y)
					if (toFront)
					{
						if (pt.X == op.pt.X + 1) return;    //ie wrong side of bottomPt
					}
					else if (pt.X == op.pt.X - 1) return; //ie wrong side of bottomPt

					outRec.sides = outRec.sides | e.side;
					if (outRec.sides == EdgeSide.BOTH)
					{
						//A vertex from each side has now been added.
						//Vertices of one side of an output polygon are quite commonly close to
						//or even 'touching' edges of the other side of the output polygon.
						//Very occasionally vertices from one side can 'cross' an edge on the
						//the other side. The distance 'crossed' is always less that a unit
						//and is purely an artefact of coordinate rounding. Nevertheless, this
						//results in very tiny self-intersections. Because of the way
						//orientation is calculated, even tiny self-intersections can cause
						//the Orientation  to return the wrong result. Therefore, it's
						//important to ensure that any self-intersections close to BottomPt are
						//detected and removed before orientation is assigned.

						if (toFront)
						{
							opBot = outRec.pts;
							op2 = opBot.next; //op2 == right side
							if (opBot.pt.Y != op2.pt.Y && opBot.pt.Y != pt.Y &&
								((opBot.pt.X - pt.X) / (opBot.pt.Y - pt.Y) <
								(opBot.pt.X - op2.pt.X) / (opBot.pt.Y - op2.pt.Y)))
							{
								outRec.bottomFlag = opBot;
							}
						}
						else
						{
							opBot = outRec.pts.prev;
							op2 = opBot.next; //op2 == left side
							if (opBot.pt.Y != op2.pt.Y && opBot.pt.Y != pt.Y &&
							  ((opBot.pt.X - pt.X) / (opBot.pt.Y - pt.Y) >
							   (opBot.pt.X - op2.pt.X) / (opBot.pt.Y - op2.pt.Y)))
							{
								outRec.bottomFlag = opBot;
							}
						}
					}
				}

				op2 = new OutPt();
				op2.pt = pt;
				op2.idx = outRec.idx;
				if (op2.pt.Y == outRec.bottomPt.pt.Y &&
					op2.pt.X < outRec.bottomPt.pt.X)
				{
					outRec.bottomPt = op2;
				}
				op2.next = op;
				op2.prev = op.prev;
				op2.prev.next = op2;
				op.prev = op2;
				if (toFront) outRec.pts = op2;
			}
		}
		//------------------------------------------------------------------------------

		private  getOverlapSegment(seg1:Segment, seg2:Segment, seg:Segment):Boolean
		{
			//precondition: segments are colinear.
			if ( seg1.pt1.Y == seg1.pt2.Y || Clipper.abs((seg1.pt1.X - seg1.pt2.X)/(seg1.pt1.Y - seg1.pt2.Y)) > 1 )
			{
				if (seg1.pt1.X > seg1.pt2.X) seg1.swapPoints();
				if (seg2.pt1.X > seg2.pt2.X) seg2.swapPoints();
				if (seg1.pt1.X > seg2.pt1.X) seg.pt1 = seg1.pt1; else seg.pt1 = seg2.pt1;
				if (seg1.pt2.X < seg2.pt2.X) seg.pt2 = seg1.pt2; else seg.pt2 = seg2.pt2;
				return seg.pt1.X < seg.pt2.X;
			}
			else
			{
				if (seg1.pt1.Y < seg1.pt2.Y) seg1.swapPoints();
				if (seg2.pt1.Y < seg2.pt2.Y) seg2.swapPoints();
				if (seg1.pt1.Y < seg2.pt1.Y) seg.pt1 = seg1.pt1; else seg.pt1 = seg2.pt1;
				if (seg1.pt2.Y > seg2.pt2.Y) seg.pt2 = seg1.pt2; else seg.pt2 = seg2.pt2;
				return seg.pt1.Y > seg.pt2.Y;
			}
		}
		//------------------------------------------------------------------------------

		private  findSegment(ppRef:OutPtRef, seg:Segment):Boolean
		{
			var pp:OutPt = ppRef.outPt;
			if (pp == null) return false;
			var pp2:OutPt = pp;
			var pt1a:IntPoint = seg.pt1;
			var pt2a:IntPoint = seg.pt2;
			var seg1:Segment = new Segment(pt1a, pt2a);
			do
			{
				var seg2:Segment = new Segment(pp.pt, pp.prev.pt);
				if (this.slopesEqual4(pt1a, pt2a, pp.pt, pp.prev.pt, true) &&
                    this.slopesEqual3(pt1a, pt2a, pp.pt, true) &&
                    this.getOverlapSegment(seg1, seg2, seg))
				{
					return true;
				}
				pp = pp.next;
				ppRef.outPt = pp; // update the reference for the caller.
			} while (pp != pp2);
			return false;
		}
		//------------------------------------------------------------------------------

		  pt3IsBetweenPt1AndPt2(pt1:IntPoint, pt2:IntPoint, pt3:IntPoint):Boolean
		{
			if (ClipperBase.pointsEqual(pt1, pt3) || ClipperBase.pointsEqual(pt2, pt3)) return true;
			else if (pt1.X != pt2.X) return (pt1.X < pt3.X) == (pt3.X < pt2.X);
			else return (pt1.Y < pt3.Y) == (pt3.Y < pt2.Y);
		}
		//------------------------------------------------------------------------------

		private  insertPolyPtBetween(p1:OutPt, p2:OutPt, pt:IntPoint):OutPt
		{
			var result:OutPt = new OutPt();
			result.pt = pt;
			if (p2 == p1.next)
			{
				p1.next = result;
				p2.prev = result;
				result.next = p2;
				result.prev = p1;
			} else
			{
				p2.next = result;
				p1.prev = result;
				result.next = p1;
				result.prev = p2;
			}
			return result;
		}
		//------------------------------------------------------------------------------

		private  setHoleState(e:TEdge, outRec:OutRec):void
		{
			var isHole:Boolean = false;
			var e2:TEdge = e.prevInAEL;
			while (e2 != null)
			{
				if (e2.outIdx >= 0)
				{
					isHole = !isHole;
					if (outRec.firstLeft == null)
						outRec.firstLeft = this.m_PolyOuts[e2.outIdx];
				}
				e2 = e2.prevInAEL;
			}
			if (isHole) outRec.isHole = true;
		}
		//------------------------------------------------------------------------------

		private  getDx(pt1:IntPoint, pt2:IntPoint):number
		{
			if (pt1.Y == pt2.Y) return ClipperBase.horizontal;
			else return (Number)(pt2.X - pt1.X) / (Number)(pt2.Y - pt1.Y);
		}
		//---------------------------------------------------------------------------

		private  firstIsBottomPt(btmPt1:OutPt, btmPt2:OutPt):Boolean
		{
			var p:OutPt = btmPt1.prev;
			while (ClipperBase.pointsEqual(p.pt, btmPt1.pt) && (p != btmPt1)) p = p.prev;
			var dx1p:number = Math.abs(this.getDx(btmPt1.pt, p.pt));
			p = btmPt1.next;
			while (ClipperBase.pointsEqual(p.pt, btmPt1.pt) && (p != btmPt1)) p = p.next;
			var dx1n:number = Math.abs(this.getDx(btmPt1.pt, p.pt));

			p = btmPt2.prev;
			while (ClipperBase.pointsEqual(p.pt, btmPt2.pt) && (p != btmPt2)) p = p.prev;
			var dx2p:number = Math.abs(this.getDx(btmPt2.pt, p.pt));
			p = btmPt2.next;
			while (ClipperBase.pointsEqual(p.pt, btmPt2.pt) && (p != btmPt2)) p = p.next;
			var dx2n:number = Math.abs(this.getDx(btmPt2.pt, p.pt));
			return (dx1p >= dx2p && dx1p >= dx2n) || (dx1n >= dx2p && dx1n >= dx2n);
		}
		//------------------------------------------------------------------------------

		private  getBottomPt(pp:OutPt):OutPt
		{
			var dups:OutPt = null;
			var p:OutPt = pp.next;
			while (p != pp)
			{
				if (p.pt.Y > pp.pt.Y)
				{
					pp = p;
					dups = null;
				}
				else if (p.pt.Y == pp.pt.Y && p.pt.X <= pp.pt.X)
				{
					if (p.pt.X < pp.pt.X)
					{
						dups = null;
						pp = p;
					}
					else
					{
						if (p.next != pp && p.prev != pp) dups = p;
					}
				}
				p = p.next;
			}
			if (dups != null)
			{
				//there appears to be at least 2 vertices at bottomPt so ...
				while (dups != p)
				{
					if (!this.firstIsBottomPt(p, dups)) pp = dups;
					dups = dups.next;
					while (!ClipperBase.pointsEqual(dups.pt, pp.pt)) dups = dups.next;
				}
			}
			return pp;
		}
		//------------------------------------------------------------------------------

		private  getLowermostRec(outRec1:OutRec, outRec2:OutRec):OutRec
		{
			//work out which polygon fragment has the correct hole state ...
			var bPt1:OutPt = outRec1.bottomPt;
			var bPt2:OutPt = outRec2.bottomPt;
			if (bPt1.pt.Y > bPt2.pt.Y) return outRec1;
			else if (bPt1.pt.Y < bPt2.pt.Y) return outRec2;
			else if (bPt1.pt.X < bPt2.pt.X) return outRec1;
			else if (bPt1.pt.X > bPt2.pt.X) return outRec2;
			else if (bPt1.next == bPt1) return outRec2;
			else if (bPt2.next == bPt2) return outRec1;
			else if (this.firstIsBottomPt(bPt1, bPt2)) return outRec1;
			else return outRec2;
		}
		//------------------------------------------------------------------------------

		private  param1RightOfParam2(outRec1:OutRec, outRec2:OutRec):Boolean
		{
			do
			{
				outRec1 = outRec1.firstLeft;
				if (outRec1 == outRec2) return true;
			} while (outRec1 != null);
			return false;
		}
		//------------------------------------------------------------------------------

		private  appendPolygon(e1:TEdge, e2:TEdge):void
		{
			//get the start and ends of both output polygons ...
			var outRec1:OutRec = this.m_PolyOuts[e1.outIdx];
			var outRec2:OutRec = this.m_PolyOuts[e2.outIdx];

			var holeStateRec:OutRec;
			if (this.param1RightOfParam2(outRec1, outRec2)) holeStateRec = outRec2;
			else if (this.param1RightOfParam2(outRec2, outRec1)) holeStateRec = outRec1;
			else holeStateRec = this.getLowermostRec(outRec1, outRec2);

			var p1_lft:OutPt = outRec1.pts;
			var p1_rt:OutPt = p1_lft.prev;
			var p2_lft:OutPt = outRec2.pts;
			var p2_rt:OutPt = p2_lft.prev;

			var side:number; //EdgeSide
			//join e2 poly onto e1 poly and delete pointers to e2 ...
			if(  e1.side == EdgeSide.LEFT )
			{
				if (e2.side == EdgeSide.LEFT)
				{
					//z y x a b c
					this.reversePolyPtLinks(p2_lft);
					p2_lft.next = p1_lft;
					p1_lft.prev = p2_lft;
					p1_rt.next = p2_rt;
					p2_rt.prev = p1_rt;
					outRec1.pts = p2_rt;
				}
				else
				{
					//x y z a b c
					p2_rt.next = p1_lft;
					p1_lft.prev = p2_rt;
					p2_lft.prev = p1_rt;
					p1_rt.next = p2_lft;
					outRec1.pts = p2_lft;
				}
				side = EdgeSide.LEFT;
			}
			else
			{
				if (e2.side == EdgeSide.RIGHT)
				{
					//a b c z y x
					this.reversePolyPtLinks( p2_lft );
					p1_rt.next = p2_rt;
					p2_rt.prev = p1_rt;
					p2_lft.next = p1_lft;
					p1_lft.prev = p2_lft;
				}
				else
				{
					//a b c x y z
					p1_rt.next = p2_lft;
					p2_lft.prev = p1_rt;
					p1_lft.prev = p2_rt;
					p2_rt.next = p1_lft;
				}
				side = EdgeSide.RIGHT;
			}

			if (holeStateRec == outRec2)
			{
				outRec1.bottomPt = outRec2.bottomPt;
				outRec1.bottomPt.idx = outRec1.idx;
				if (outRec2.firstLeft != outRec1)
				{
					outRec1.firstLeft = outRec2.firstLeft;
				}
				outRec1.isHole = outRec2.isHole;
			}
			outRec2.pts = null;
			outRec2.bottomPt = null;
			outRec2.appendLink = outRec1;
			var oKIdx:number = e1.outIdx;
			var obsoleteIdx:number = e2.outIdx;

			e1.outIdx = -1; //nb: safe because we only get here via AddLocalMaxPoly
			e2.outIdx = -1;

			var e:TEdge = this.m_ActiveEdges;
			while( e != null )
			{
				if( e.outIdx == obsoleteIdx )
				{
					e.outIdx = oKIdx;
					e.side = side;
					break;
				}
				e = e.nextInAEL;
			}

			for (var i:number = 0; i < this.m_Joins.length; ++i)
			{
				if (this.m_Joins[i].poly1Idx == obsoleteIdx) this.m_Joins[i].poly1Idx = oKIdx;
				if (this.m_Joins[i].poly2Idx == obsoleteIdx) this.m_Joins[i].poly2Idx = oKIdx;
			}

			for (i = 0; i < this.m_HorizJoins.length; ++i)
			{
				if (this.m_HorizJoins[i].savedIdx == obsoleteIdx)
				{
					this.m_HorizJoins[i].savedIdx = oKIdx;
				}
			}
		}
		//------------------------------------------------------------------------------

		private  reversePolyPtLinks(pp:OutPt):void
		{
			var pp1:OutPt;
			var pp2:OutPt;
			pp1 = pp;
			do
			{
				pp2 = pp1.next;
				pp1.next = pp1.prev;
				pp1.prev = pp2;
				pp1 = pp2;
			} while (pp1 != pp);
		}
		//------------------------------------------------------------------------------

		private static  swapSides(edge1:TEdge, edge2:TEdge):void
		{
			var side:number = edge1.side; //EdgeSide
			edge1.side = edge2.side;
			edge2.side = side;
		}
		//------------------------------------------------------------------------------

		private static  swapPolyIndexes(edge1:TEdge, edge2:TEdge):void
		{
			var outIdx:number = edge1.outIdx;
			edge1.outIdx = edge2.outIdx;
			edge2.outIdx = outIdx;
		}
		//------------------------------------------------------------------------------

		private  doEdge1(edge1:TEdge, edge2:TEdge, pt:IntPoint):void
		{
			this.addOutPt(edge1, pt);
            Clipper.swapSides(edge1, edge2);
            Clipper.swapPolyIndexes(edge1, edge2);
		}
		//------------------------------------------------------------------------------

		private  doEdge2(edge1:TEdge, edge2:TEdge, pt:IntPoint):void
		{
            this.addOutPt(edge2, pt);
            Clipper.swapSides(edge1, edge2);
            Clipper.swapPolyIndexes(edge1, edge2);
		}
		//------------------------------------------------------------------------------

		private  doBothEdges(edge1:TEdge, edge2:TEdge, pt:IntPoint):void
		{
			this.addOutPt(edge1, pt);
            this.addOutPt(edge2, pt);
            Clipper.swapSides(edge1, edge2);
            Clipper.swapPolyIndexes(edge1, edge2);
		}
		//------------------------------------------------------------------------------

		private  intersectEdges(e1:TEdge, e2:TEdge, pt:IntPoint, protects:number):void
		{
			//e1 will be to the left of e2 BELOW the intersection. Therefore e1 is before
			//e2 in AEL except when e1 is being inserted at the intersection point ...

			var e1stops:Boolean = (Protects.LEFT & protects) == 0 && e1.nextInLML == null &&
				e1.xtop == pt.X && e1.ytop == pt.Y;
			var e2stops:Boolean = (Protects.RIGHT & protects) == 0 && e2.nextInLML == null &&
				e2.xtop == pt.X && e2.ytop == pt.Y;
			var e1Contributing:Boolean = (e1.outIdx >= 0);
			var e2contributing:Boolean = (e2.outIdx >= 0);

			//update winding counts...
			//assumes that e1 will be to the right of e2 ABOVE the intersection
			if (e1.polyType == e2.polyType)
			{
				if (this.isEvenOddFillType(e1))
				{
					var oldE1WindCnt:number = e1.windCnt;
					e1.windCnt = e2.windCnt;
					e2.windCnt = oldE1WindCnt;
				}
				else
				{
					if (e1.windCnt + e2.windDelta == 0) e1.windCnt = -e1.windCnt;
					else e1.windCnt += e2.windDelta;
					if (e2.windCnt - e1.windDelta == 0) e2.windCnt = -e2.windCnt;
					else e2.windCnt -= e1.windDelta;
				}
			}
			else
			{
				if (!this.isEvenOddFillType(e2)) e1.windCnt2 += e2.windDelta;
				else e1.windCnt2 = (e1.windCnt2 == 0) ? 1 : 0;
				if (!this.isEvenOddFillType(e1)) e2.windCnt2 -= e1.windDelta;
				else e2.windCnt2 = (e2.windCnt2 == 0) ? 1 : 0;
			}

			var e1FillType:number, e2FillType:number, e1FillType2:number, e2FillType2:number; //PolyFillType
			if (e1.polyType == PolyType.SUBJECT)
			{
				e1FillType = this.m_SubjFillType;
				e1FillType2 = this.m_ClipFillType;
			}
			else
			{
				e1FillType = this.m_ClipFillType;
				e1FillType2 = this.m_SubjFillType;
			}
			if (e2.polyType == PolyType.SUBJECT)
			{
				e2FillType = this.m_SubjFillType;
				e2FillType2 = this.m_ClipFillType;
			}
			else
			{
				e2FillType = this.m_ClipFillType;
				e2FillType2 = this.m_SubjFillType;
			}

			var e1Wc:number, e2Wc:number;
			switch (e1FillType)
			{
				case PolyFillType.POSITIVE: e1Wc = e1.windCnt; break;
				case PolyFillType.NEGATIVE: e1Wc = -e1.windCnt; break;
				default: e1Wc = Clipper.abs(e1.windCnt); break;
			}
			switch (e2FillType)
			{
				case PolyFillType.POSITIVE: e2Wc = e2.windCnt; break;
				case PolyFillType.NEGATIVE: e2Wc = -e2.windCnt; break;
				default: e2Wc = Clipper.abs(e2.windCnt); break;
			}


			if (e1Contributing && e2contributing)
			{
				if ( e1stops || e2stops ||
				  (e1Wc != 0 && e1Wc != 1) || (e2Wc != 0 && e2Wc != 1) ||
				  (e1.polyType != e2.polyType && this.m_ClipType != ClipType.XOR))
                    this.addLocalMaxPoly(e1, e2, pt);
				else
                    this.doBothEdges(e1, e2, pt);


			}
			else if (e1Contributing)
			{
				if ((e2Wc == 0 || e2Wc == 1) &&
				  (this.m_ClipType != ClipType.INTERSECTION ||
					e2.polyType == PolyType.SUBJECT || (e2.windCnt2 != 0)))
                    this.doEdge1(e1, e2, pt);
			}
			else if (e2contributing)
			{
				if ((e1Wc == 0 || e1Wc == 1) &&
				  (this.m_ClipType != ClipType.INTERSECTION ||
								e1.polyType == PolyType.SUBJECT || (e1.windCnt2 != 0)))
                    this.doEdge2(e1, e2, pt);
			}
			else if ( (e1Wc == 0 || e1Wc == 1) &&
				(e2Wc == 0 || e2Wc == 1) && !e1stops && !e2stops )
			{
				//neither edge is currently contributing ...
				var e1Wc2:number, e2Wc2:number;
				switch (e1FillType2)
				{
					case PolyFillType.POSITIVE: e1Wc2 = e1.windCnt2; break;
					case PolyFillType.NEGATIVE: e1Wc2 = -e1.windCnt2; break;
					default: e1Wc2 = Clipper.abs(e1.windCnt2); break;
				}
				switch (e2FillType2)
				{
					case PolyFillType.POSITIVE: e2Wc2 = e2.windCnt2; break;
					case PolyFillType.NEGATIVE: e2Wc2 = -e2.windCnt2; break;
					default: e2Wc2 = Clipper.abs(e2.windCnt2); break;
				}

				if (e1.polyType != e2.polyType)
                    this.addLocalMinPoly(e1, e2, pt);
				else if (e1Wc == 1 && e2Wc == 1)
					switch (this.m_ClipType)
					{
						case ClipType.INTERSECTION:
							{
								if (e1Wc2 > 0 && e2Wc2 > 0)
                                    this.addLocalMinPoly(e1, e2, pt);
								break;
							}
						case ClipType.UNION:
							{
								if (e1Wc2 <= 0 && e2Wc2 <= 0)
                                    this.addLocalMinPoly(e1, e2, pt);
								break;
							}
						case ClipType.DIFFERENCE:
							{
								if (((e1.polyType == PolyType.CLIP) && (e1Wc2 > 0) && (e2Wc2 > 0)) ||
								   ((e1.polyType == PolyType.SUBJECT) && (e1Wc2 <= 0) && (e2Wc2 <= 0)))
                                    this.addLocalMinPoly(e1, e2, pt);
								break;
							}
						case ClipType.XOR:
							{
                                this.addLocalMinPoly(e1, e2, pt);
								break;
							}
					}
				else
                    Clipper.swapSides(e1, e2);
			}

			if ((e1stops != e2stops) &&
			  ((e1stops && (e1.outIdx >= 0)) || (e2stops && (e2.outIdx >= 0))))
			{
                Clipper.swapSides(e1, e2);
                Clipper.swapPolyIndexes(e1, e2);
			}

			//finally, delete any non-contributing maxima edges  ...
			if (e1stops) this.deleteFromAEL(e1);
			if (e2stops) this.deleteFromAEL(e2);
		}
		//------------------------------------------------------------------------------

		private  deleteFromAEL(e:TEdge):void
		{
			var AelPrev:TEdge = e.prevInAEL;
			var AelNext:TEdge = e.nextInAEL;
			if (AelPrev == null && AelNext == null && (e != this.m_ActiveEdges))
				return; //already deleted
			if (AelPrev != null)
				AelPrev.nextInAEL = AelNext;
			else this.m_ActiveEdges = AelNext;
			if (AelNext != null)
				AelNext.prevInAEL = AelPrev;
			e.nextInAEL = null;
			e.prevInAEL = null;
		}
		//------------------------------------------------------------------------------

		private  deleteFromSEL(e:TEdge):void
		{
			var SelPrev:TEdge = e.prevInSEL;
			var SelNext:TEdge = e.nextInSEL;
			if (SelPrev == null && SelNext == null && (e != this.m_SortedEdges))
				return; //already deleted
			if (SelPrev != null)
				SelPrev.nextInSEL = SelNext;
			else this.m_SortedEdges = SelNext;
			if (SelNext != null)
				SelNext.prevInSEL = SelPrev;
			e.nextInSEL = null;
			e.prevInSEL = null;
		}
		//------------------------------------------------------------------------------

		private  updateEdgeIntoAEL(e:TEdge):TEdge
		{
			if (e.nextInLML == null)
				throw new ClipperException("UpdateEdgeIntoAEL: invalid call");
			var AelPrev:TEdge = e.prevInAEL;
			var AelNext:TEdge  = e.nextInAEL;
			e.nextInLML.outIdx = e.outIdx;
			if (AelPrev != null)
				AelPrev.nextInAEL = e.nextInLML;
			else this.m_ActiveEdges = e.nextInLML;
			if (AelNext != null)
				AelNext.prevInAEL = e.nextInLML;
			e.nextInLML.side = e.side;
			e.nextInLML.windDelta = e.windDelta;
			e.nextInLML.windCnt = e.windCnt;
			e.nextInLML.windCnt2 = e.windCnt2;
			e = e.nextInLML;
			e.prevInAEL = AelPrev;
			e.nextInAEL = AelNext;
			if (e.dx != ClipperBase.horizontal) this.insertScanbeam(e.ytop);
			return e;
		}
		//------------------------------------------------------------------------------

		private  processHorizontals():void
		{
			var horzEdge:TEdge = this.m_SortedEdges;
			while (horzEdge != null)
			{
                this.deleteFromSEL(horzEdge);
                this.processHorizontal(horzEdge);
				horzEdge = this.m_SortedEdges;
			}
		}
		//------------------------------------------------------------------------------

		private  processHorizontal(horzEdge:TEdge):void
		{
			var direction:number; // Direction
			var horzLeft:number, horzRight:number;

			if (horzEdge.xcurr < horzEdge.xtop)
			{
				horzLeft = horzEdge.xcurr;
				horzRight = horzEdge.xtop;
				direction = Direction.LEFT_TO_RIGHT;
			}
			else
			{
				horzLeft = horzEdge.xtop;
				horzRight = horzEdge.xcurr;
				direction = Direction.RIGHT_TO_LEFT;
			}

			var eMaxPair:TEdge;
			if (horzEdge.nextInLML != null)
				eMaxPair = null;
			else
				eMaxPair = Clipper.getMaximaPair(horzEdge);

			var e:TEdge = Clipper.getNextInAEL(horzEdge, direction);
			while (e != null)
			{
				var eNext:TEdge = Clipper.getNextInAEL(e, direction);
				if (eMaxPair != null ||
				  ((direction == Direction.LEFT_TO_RIGHT) && (e.xcurr <= horzRight)) ||
				  ((direction == Direction.RIGHT_TO_LEFT) && (e.xcurr >= horzLeft)))
				{
					//ok, so far it looks like we're still in range of the ClipperBase.horizontal edge
					if (e.xcurr == horzEdge.xtop && eMaxPair == null)
					{
						if (this.slopesEqual(e, horzEdge.nextInLML, this.m_UseFullRange))
						{
							//if output polygons share an edge, they'll need joining later ...
							if (horzEdge.outIdx >= 0 && e.outIdx >= 0)
								this.addJoin(horzEdge.nextInLML, e, horzEdge.outIdx, -1);
							break; //we've reached the end of the ClipperBase.horizontal line
						}
						else if (e.dx < horzEdge.nextInLML.dx)
							//we really have got to the end of the intermediate horz edge so quit.
							//nb: More -ve slopes follow more +ve slopes ABOVE the ClipperBase.horizontal.
							break;
					}

					if (e == eMaxPair)
					{
						//horzEdge is evidently a maxima ClipperBase.horizontal and we've arrived at its end.
						if (direction == Direction.LEFT_TO_RIGHT)
							this.intersectEdges(horzEdge, e, new IntPoint(e.xcurr, horzEdge.ycurr), 0);
						else
							this.intersectEdges(e, horzEdge, new IntPoint(e.xcurr, horzEdge.ycurr), 0);
						if (eMaxPair.outIdx >= 0) throw new ClipperException("ProcessHorizontal error");
						return;
					}
					else if (e.dx == ClipperBase.horizontal && !Clipper.isMinima(e) && !(e.xcurr > e.xtop))
					{
						if (direction == Direction.LEFT_TO_RIGHT)
							this.intersectEdges(horzEdge, e, new IntPoint(e.xcurr, horzEdge.ycurr),
							  (this.isTopHorz(horzEdge, e.xcurr)) ? Protects.LEFT : Protects.BOTH);
						else
							this.intersectEdges(e, horzEdge, new IntPoint(e.xcurr, horzEdge.ycurr),
							  (this.isTopHorz(horzEdge, e.xcurr)) ? Protects.RIGHT : Protects.BOTH);
					}
					else if (direction == Direction.LEFT_TO_RIGHT)
					{
						this.intersectEdges(horzEdge, e, new IntPoint(e.xcurr, horzEdge.ycurr),
						  (this.isTopHorz(horzEdge, e.xcurr)) ? Protects.LEFT : Protects.BOTH);
					}
					else
					{
						this.intersectEdges(e, horzEdge, new IntPoint(e.xcurr, horzEdge.ycurr),
						  (this.isTopHorz(horzEdge, e.xcurr)) ? Protects.RIGHT : Protects.BOTH);
					}
					this.swapPositionsInAEL(horzEdge, e);
				}
				else if ( (direction == Direction.LEFT_TO_RIGHT &&
					e.xcurr > horzRight && horzEdge.nextInSEL == null) ||
					(direction == Direction.RIGHT_TO_LEFT &&
					e.xcurr < horzLeft && horzEdge.nextInSEL == null) )
				{
					break;
				}
				e = eNext;
			} //end while ( e )

			if (horzEdge.nextInLML != null)
			{
				if (horzEdge.outIdx >= 0)
					this.addOutPt(horzEdge, new IntPoint(horzEdge.xtop, horzEdge.ytop));
				horzEdge = this.updateEdgeIntoAEL(horzEdge);
			}
			else
			{
				if (horzEdge.outIdx >= 0)
					this.intersectEdges(horzEdge, eMaxPair,
						new IntPoint(horzEdge.xtop, horzEdge.ycurr), Protects.BOTH);
				this.deleteFromAEL(eMaxPair);
				this.deleteFromAEL(horzEdge);
			}
		}
		//------------------------------------------------------------------------------

		private  isTopHorz(horzEdge:TEdge, XPos:number):Boolean
		{
			var e:TEdge = this.m_SortedEdges;
			while (e != null)
			{
				if ((XPos >= Math.min(e.xcurr, e.xtop)) && (XPos <= Math.max(e.xcurr, e.xtop)))
					return false;
				e = e.nextInSEL;
			}
			return true;
		}
		//------------------------------------------------------------------------------

		private static  getNextInAEL(e:TEdge, direction:number):TEdge
		{
			return direction == Direction.LEFT_TO_RIGHT ? e.nextInAEL: e.prevInAEL;
		}
		//------------------------------------------------------------------------------

		private static  isMinima(e:TEdge):Boolean
		{
			return e != null && (e.prev.nextInLML != e) && (e.next.nextInLML != e);
		}
		//------------------------------------------------------------------------------

		private static  isMaxima(e:TEdge, Y:number):Boolean
		{
			return (e != null && e.ytop == Y && e.nextInLML == null);
		}
		//------------------------------------------------------------------------------

		private static  isIntermediate(e:TEdge, Y:number):Boolean
		{
			return (e.ytop == Y && e.nextInLML != null);
		}
		//------------------------------------------------------------------------------

		private static  getMaximaPair(e:TEdge):TEdge
		{
			if (!this.isMaxima(e.next, e.ytop) || (e.next.xtop != e.xtop))
			{
				return e.prev;
			}
			else
			{
				return e.next;
			}
		}
		//------------------------------------------------------------------------------

		private  processIntersections(botY:number, topY:number):Boolean
		{
			if( this.m_ActiveEdges == null ) return true;
			try {
				this.buildIntersectList(botY, topY);
				if ( this.m_IntersectNodes == null) return true;
				if ( this.fixupIntersections() ) this.processIntersectList();
				else return false;
			}
			catch (err)
			{
				this.m_SortedEdges = null;
				this.disposeIntersectNodes();
				throw new ClipperException("ProcessIntersections error");
			}
			return true;
		}
		//------------------------------------------------------------------------------

		private  buildIntersectList(botY:number, topY:number):void
		{
			if ( this.m_ActiveEdges == null ) return;

			//prepare for sorting ...
			var e:TEdge = this.m_ActiveEdges;
			e.tmpX = Clipper.topX( e, topY );
			this.m_SortedEdges = e;
			this.m_SortedEdges.prevInSEL = null;
			e = e.nextInAEL;
			while( e != null )
			{
				e.prevInSEL = e.prevInAEL;
				e.prevInSEL.nextInSEL = e;
				e.nextInSEL = null;
				e.tmpX = Clipper.topX( e, topY );
				e = e.nextInAEL;
			}

			//bubblesort ...
			var isModified:Boolean = true;
			while( isModified && this.m_SortedEdges != null )
			{
				isModified = false;
				e = this.m_SortedEdges;
				while( e.nextInSEL != null )
				{
					var eNext:TEdge = e.nextInSEL;
					var pt:IntPoint = new IntPoint();
					if(e.tmpX > eNext.tmpX && this.intersectPoint(e, eNext, pt))
					{
						if (pt.Y > botY)
						{
							pt.Y = botY;
							pt.X = Clipper.topX(e, pt.Y);
						}
						this.addIntersectNode(e, eNext, pt);
						this.swapPositionsInSEL(e, eNext);
						isModified = true;
					}
					else
					{
						e = eNext;
					}
				}
				if( e.prevInSEL != null ) e.prevInSEL.nextInSEL = null;
				else break;
			}
			this.m_SortedEdges = null;
		}
		//------------------------------------------------------------------------------

		private  fixupIntersections():Boolean
		{
			if ( this.m_IntersectNodes.next == null ) return true;

			this.copyAELToSEL();
			var int1:IntersectNode = this.m_IntersectNodes;
			var int2:IntersectNode = this.m_IntersectNodes.next;
			while (int2 != null)
			{
				var e1:TEdge = int1.edge1;
				var e2:TEdge;
				if (e1.prevInSEL == int1.edge2) e2 = e1.prevInSEL;
				else if (e1.nextInSEL == int1.edge2) e2 = e1.nextInSEL;
				else
				{
					//The current intersection is out of order, so try and swap it with
					//a subsequent intersection ...
					while (int2 != null)
					{
						if (int2.edge1.nextInSEL == int2.edge2 ||
							int2.edge1.prevInSEL == int2.edge2) break;
						else int2 = int2.next;
					}
					if (int2 == null) return false; //oops!!!

					//found an intersect node that can be swapped ...
					this.swapIntersectNodes(int1, int2);
					e1 = int1.edge1;
					e2 = int1.edge2;
				}
				this.swapPositionsInSEL(e1, e2);
				int1 = int1.next;
				int2 = int1.next;
			}

			this.m_SortedEdges = null;

			//finally, check the last intersection too ...
			return (int1.edge1.prevInSEL == int1.edge2 || int1.edge1.nextInSEL == int1.edge2);
		}
		//------------------------------------------------------------------------------

		private  processIntersectList():void
		{
			while( this.m_IntersectNodes != null )
			{
				var iNode:IntersectNode = this.m_IntersectNodes.next;
				{
					this.intersectEdges( this.m_IntersectNodes.edge1 ,
								this.m_IntersectNodes.edge2 , this.m_IntersectNodes.pt, Protects.BOTH );
					this.swapPositionsInAEL( this.m_IntersectNodes.edge1 , this.m_IntersectNodes.edge2 );
				}
				this.m_IntersectNodes = null;
				this.m_IntersectNodes = iNode;
			}
		}
		//------------------------------------------------------------------------------

        static float2int (value) {
           return value | 0;
        }

		private static  round(value:number):number
		{
			return value < 0 ? Clipper.float2int(value - 0.5) : Clipper.float2int(value + 0.5);
		}
		//------------------------------------------------------------------------------

		private static  topX(edge:TEdge, currentY:number):number
		{
			if (currentY == edge.ytop)
				return edge.xtop;
			return edge.xbot + Clipper.round(edge.dx *(currentY - edge.ybot));
		}
		//------------------------------------------------------------------------------
/*
		private Int64 TopX(IntPoint pt1, IntPoint pt2, Int64 currentY)
		{
		  //preconditions: pt1.Y <> pt2.Y and pt1.Y > pt2.Y
		  if (currentY >= pt1.Y) return pt1.X;
		  else if (currentY == pt2.Y) return pt2.X;
		  else if (pt1.X == pt2.X) return pt1.X;
		  else
		  {
			double q = (pt1.X-pt2.X)/(pt1.Y-pt2.Y);
			return (Int64)Round(pt1.X + (currentY - pt1.Y) * q);
		  }
		}
		//------------------------------------------------------------------------------
*/
		private  addIntersectNode(e1:TEdge, e2:TEdge, pt:IntPoint):void
		{
			var newNode:IntersectNode = new IntersectNode();
			newNode.edge1 = e1;
			newNode.edge2 = e2;
			newNode.pt = pt;
			newNode.next = null;
			if (this.m_IntersectNodes == null) this.m_IntersectNodes = newNode;
			else if (this.processParam1BeforeParam2(newNode, this.m_IntersectNodes))
			{
				newNode.next = this.m_IntersectNodes;
				this.m_IntersectNodes = newNode;
			}
			else
			{
				var iNode:IntersectNode = this.m_IntersectNodes;
				while (iNode.next != null && this.processParam1BeforeParam2(iNode.next, newNode))
					iNode = iNode.next;
				newNode.next = iNode.next;
				iNode.next = newNode;
			}
		}
		//------------------------------------------------------------------------------

		private  processParam1BeforeParam2(node1:IntersectNode, node2:IntersectNode):Boolean
		{
			var result:Boolean;
			if (node1.pt.Y == node2.pt.Y)
			{
				if (node1.edge1 == node2.edge1 || node1.edge2 == node2.edge1)
				{
					result = node2.pt.X > node1.pt.X;
					return node2.edge1.dx > 0 ? !result : result;
				}
				else if (node1.edge1 == node2.edge2 || node1.edge2 == node2.edge2)
				{
					result = node2.pt.X > node1.pt.X;
					return node2.edge2.dx > 0 ? !result : result;
				}
				else return node2.pt.X > node1.pt.X;
			}
			else return node1.pt.Y > node2.pt.Y;
		}
		//------------------------------------------------------------------------------

		private  swapIntersectNodes(int1:IntersectNode, int2:IntersectNode):void
		{
			var e1:TEdge = int1.edge1;
			var e2:TEdge = int1.edge2;
			var p:IntPoint = int1.pt;
			int1.edge1 = int2.edge1;
			int1.edge2 = int2.edge2;
			int1.pt = int2.pt;
			int2.edge1 = e1;
			int2.edge2 = e2;
			int2.pt = p;
		}
		//------------------------------------------------------------------------------

		private  intersectPoint(edge1:TEdge, edge2:TEdge, ip:IntPoint):Boolean
		{
			var b1:number, b2:number;
			if (this.slopesEqual(edge1, edge2, this.m_UseFullRange)) return false;
			else if (edge1.dx == 0)
			{
				ip.X = edge1.xbot;
				if (edge2.dx == ClipperBase.horizontal)
				{
					ip.Y = edge2.ybot;
				}
				else
				{
					b2 = edge2.ybot - (edge2.xbot/edge2.dx);
					ip.Y = Clipper.round(ip.X/edge2.dx + b2);
				}
			}
			else if (edge2.dx == 0)
			{
				ip.X = edge2.xbot;
				if (edge1.dx == ClipperBase.horizontal)
				{
					ip.Y = edge1.ybot;
				}
				else
				{
					b1 = edge1.ybot - (edge1.xbot/edge1.dx);
					ip.Y = Clipper.round(ip.X/edge1.dx + b1);
				}
			}
			else
			{
				b1 = edge1.xbot - edge1.ybot * edge1.dx;
				b2 = edge2.xbot - edge2.ybot * edge2.dx;
				b2 = (b2-b1)/(edge1.dx - edge2.dx);
				ip.Y = Clipper.round(b2);
				ip.X = Clipper.round(edge1.dx * b2 + b1);
			}

			//can be *so close* to the top of one edge that the rounded Y equals one ytop ...
			return	(ip.Y == edge1.ytop && ip.Y >= edge2.ytop && edge1.tmpX > edge2.tmpX) ||
					(ip.Y == edge2.ytop && ip.Y >= edge1.ytop && edge1.tmpX > edge2.tmpX) ||
					(ip.Y > edge1.ytop && ip.Y > edge2.ytop);
		}
		//------------------------------------------------------------------------------

		private  disposeIntersectNodes():void
		{
			while ( this.m_IntersectNodes != null )
			{
				var iNode:IntersectNode = this.m_IntersectNodes.next;
				this.m_IntersectNodes = null;
				this.m_IntersectNodes = iNode;
			}
		}
		//------------------------------------------------------------------------------

		private  processEdgesAtTopOfScanbeam(topY:number):void
		{
			var e:TEdge = this.m_ActiveEdges;
			while( e != null )
			{
				//1. process maxima, treating them as if they're 'bent' ClipperBase.horizontal edges,
				//   but exclude maxima with ClipperBase.horizontal edges. nb: e can't be a ClipperBase.horizontal.
				if( Clipper.isMaxima(e, topY) && Clipper.getMaximaPair(e).dx != ClipperBase.horizontal )
				{
					//'e' might be removed from AEL, as may any following edges so ...
					var ePrior:TEdge = e.prevInAEL;
                    this.doMaxima(e, topY);
					if( ePrior == null ) e = this.m_ActiveEdges;
					else e = ePrior.nextInAEL;
				}
				else
				{
					//2. promote ClipperBase.horizontal edges, otherwise update xcurr and ycurr ...
					if( Clipper.isIntermediate(e, topY) && e.nextInLML.dx == ClipperBase.horizontal )
					{
						if (e.outIdx >= 0)
						{
							this.addOutPt(e, new IntPoint(e.xtop, e.ytop));

							for (var i:number = 0; i < this.m_HorizJoins.length; ++i)
							{
								var hj:HorzJoinRec = this.m_HorizJoins[i];
								var pt1a:IntPoint = new IntPoint(hj.edge.xbot, hj.edge.ybot);
								var pt1b:IntPoint = new IntPoint(hj.edge.xtop, hj.edge.ytop);
								var pt2a:IntPoint = new IntPoint(e.nextInLML.xbot, e.nextInLML.ybot);
								var pt2b:IntPoint = new IntPoint(e.nextInLML.xtop, e.nextInLML.ytop);
								if (this.getOverlapSegment(
									new Segment(pt1a, pt1b),
									new Segment(pt2a, pt2b),
									new Segment(null, null)))
								{
                                    this.addJoin(hj.edge, e.nextInLML, hj.savedIdx, e.outIdx);
								}
							}

                            this.addHorzJoin(e.nextInLML, e.outIdx);
						}
						e = this.updateEdgeIntoAEL(e);
                        this.addEdgeToSEL(e);
					}
					else
					{
						//this just simplifies ClipperBase.horizontal processing ...
						e.xcurr = Clipper.topX( e, topY );
						e.ycurr = topY;
					}
					e = e.nextInAEL;
				}
			}

			//3. Process horizontals at the top of the scanbeam ...
            this.processHorizontals();

			//4. Promote intermediate vertices ...
			e = this.m_ActiveEdges;
			while( e != null )
			{
				if( Clipper.isIntermediate( e, topY ) )
				{
					if (e.outIdx >= 0) this.addOutPt(e, new IntPoint(e.xtop, e.ytop));
					e = this.updateEdgeIntoAEL(e);

					//if output polygons share an edge, they'll need joining later ...
					if (e.outIdx >= 0 && e.prevInAEL != null && e.prevInAEL.outIdx >= 0 &&
						e.prevInAEL.xcurr == e.xbot && e.prevInAEL.ycurr == e.ybot &&
						this.slopesEqual4(
							new IntPoint(e.xbot, e.ybot),
							new IntPoint(e.xtop, e.ytop),
							new IntPoint(e.xbot, e.ybot),
							new IntPoint(e.prevInAEL.xtop, e.prevInAEL.ytop),
							this.m_UseFullRange))
					{
						this.addOutPt(e.prevInAEL, new IntPoint(e.xbot, e.ybot));
                        this.addJoin(e, e.prevInAEL, -1, -1);
					}
					else if (e.outIdx >= 0 && e.nextInAEL != null && e.nextInAEL.outIdx >= 0 &&
						e.nextInAEL.ycurr > e.nextInAEL.ytop &&
						e.nextInAEL.ycurr <= e.nextInAEL.ybot &&
						e.nextInAEL.xcurr == e.xbot && e.nextInAEL.ycurr == e.ybot &&
                        this.slopesEqual4(
							new IntPoint(e.xbot, e.ybot),
							new IntPoint(e.xtop, e.ytop),
							new IntPoint(e.xbot, e.ybot),
							new IntPoint(e.nextInAEL.xtop, e.nextInAEL.ytop), this.m_UseFullRange))
					{
                        this.addOutPt(e.nextInAEL, new IntPoint(e.xbot, e.ybot));
                        this.addJoin(e, e.nextInAEL, -1, -1);
					}
				}
				e = e.nextInAEL;
			}
		}
		//------------------------------------------------------------------------------

		private  doMaxima(e:TEdge, topY:number):void
		{
			var eMaxPair:TEdge = Clipper.getMaximaPair(e);
			var X:number = e.xtop;
			var eNext:TEdge = e.nextInAEL;
			while( eNext != eMaxPair )
			{
				if (eNext == null) throw new ClipperException("DoMaxima error");
				this.intersectEdges( e, eNext, new IntPoint(X, topY), Protects.BOTH );
				eNext = eNext.nextInAEL;
			}
			if( e.outIdx < 0 && eMaxPair.outIdx < 0 )
			{
                this.deleteFromAEL( e );
                this.deleteFromAEL( eMaxPair );
			}
			else if( e.outIdx >= 0 && eMaxPair.outIdx >= 0 )
			{
                this.intersectEdges(e, eMaxPair, new IntPoint(X, topY), Protects.NONE);
			}
			else throw new ClipperException("DoMaxima error");
		}
		//------------------------------------------------------------------------------

		public static  reversePolygons(polys:Polygons) : void
		{
            var polygons:Polygon[]= polys.getPolygons();
			for(var i:number=0;i<polygons.length;i++)
                polygons[i].reverse();
		}
		//------------------------------------------------------------------------------

		public static  orientation(polygon:Polygon):Boolean
		{
			var poly:IntPoint[] = polygon.getPoints();
			var highI:number = poly.length -1;
			if (highI < 2) return false;
			var j:number = 0, jplus:number, jminus:number;
			for (var i:number = 0; i <= highI; ++i)
			{
				if (poly[i].Y < poly[j].Y) continue;
				if ((poly[i].Y > poly[j].Y || poly[i].X < poly[j].X)) j = i;
			}
			if (j == highI) jplus = 0;
			else jplus = j +1;
			if (j == 0) jminus = highI;
			else jminus = j -1;

			//get cross product of vectors of the edges adjacent to highest point ...
			var vec1:IntPoint = new IntPoint(poly[j].X - poly[jminus].X, poly[j].Y - poly[jminus].Y);
			var vec2:IntPoint = new IntPoint(poly[jplus].X - poly[j].X, poly[jplus].Y - poly[j].Y);
			if (ClipperBase.abs(vec1.X) > ClipperBase.loRange || ClipperBase.abs(vec1.Y) > ClipperBase.loRange ||
                ClipperBase.abs(vec2.X) > ClipperBase.loRange || ClipperBase.abs(vec2.Y) > ClipperBase.loRange)
			{
				if (ClipperBase.abs(vec1.X) > ClipperBase.hiRange || ClipperBase.abs(vec1.Y) > ClipperBase.hiRange ||
                    ClipperBase.abs(vec2.X) > ClipperBase.hiRange || ClipperBase.abs(vec2.Y) > ClipperBase.hiRange)
				{
					throw new ClipperException("Coordinate exceeds range bounds.");
				}
				return IntPoint.cross(vec1, vec2) >= 0;
			}
			else
			{
				return IntPoint.cross(vec1, vec2) >=0;
			}
		}
		//------------------------------------------------------------------------------

		private  orientationOutRec(outRec:OutRec, useFull64BitRange:Boolean):Boolean
		{
			//first make sure bottomPt is correctly assigned ...
			var opBottom:OutPt = outRec.pts, op:OutPt = outRec.pts.next;
			while (op != outRec.pts) 
			{
				if (op.pt.Y >= opBottom.pt.Y) 
				{
					if (op.pt.Y > opBottom.pt.Y || op.pt.X < opBottom.pt.X) 
					opBottom = op;
				}
				op = op.next;
			}
			outRec.bottomPt = opBottom;
			opBottom.idx = outRec.idx;
			
			op = opBottom;
			//find vertices either side of bottomPt (skipping duplicate points) ....
			var opPrev:OutPt = op.prev;
			var opNext:OutPt = op.next;
			while (op != opPrev && ClipperBase.pointsEqual(op.pt, opPrev.pt)) 
			  opPrev = opPrev.prev;
			while (op != opNext && ClipperBase.pointsEqual(op.pt, opNext.pt))
			  opNext = opNext.next;

			var vec1:IntPoint = new IntPoint(op.pt.X - opPrev.pt.X, op.pt.Y - opPrev.pt.Y);
			var vec2:IntPoint = new IntPoint(opNext.pt.X - op.pt.X, opNext.pt.Y - op.pt.Y);

			if (useFull64BitRange)
			{
				//Int128 cross = Int128.Int128Mul(vec1.X, vec2.Y) - Int128.Int128Mul(vec2.X, vec1.Y);
				//return !cross.IsNegative();
				return IntPoint.cross(vec1, vec2) >= 0;
			}
			else
			{
				return IntPoint.cross(vec1, vec2) >= 0;
			}

		}
		//------------------------------------------------------------------------------

		private  pointCount(pts:OutPt):number
		{
			if (pts == null) return 0;
			var result:number = 0;
			var p:OutPt = pts;
			do
			{
				result++;
				p = p.next;
			}
			while (p != pts);
			return result;
		}
		//------------------------------------------------------------------------------

		private  buildResult(polyg:Polygons):void
		{
			polyg.clear();

			for (var i:number=0; i<this.m_PolyOuts.length;i++)
			{

                var outRec:OutRec= this.m_PolyOuts[i];
				if (outRec.pts == null)
                    continue;
				var p:OutPt = outRec.pts;
				var cnt:number = this.pointCount(p);
				if (cnt < 3) continue;
				var pg:Polygon = new Polygon();
				for (var j:number = 0; j < cnt; j++)
				{
					pg.addPoint(p.pt);
					p = p.next;
				}
				polyg.addPolygon(pg);
			}
		}
		//------------------------------------------------------------------------------
/*
		private void BuildResultEx(ExPolygons polyg)
		{         
			polyg.Clear();
			polyg.Capacity = this.m_PolyOuts.Count;
			int i = 0;
			while (i < this.m_PolyOuts.Count)
			{
				OutRec outRec = this.m_PolyOuts[i++];
				if (outRec.pts == null) break; //nb: already sorted here
				OutPt p = outRec.pts;
				int cnt = PointCount(p);
				if (cnt < 3) continue;
				ExPolygon epg = new ExPolygon();
				epg.outer = new Polygon(cnt);
				epg.holes = new Polygons();
				for (int j = 0; j < cnt; j++)
				{
					epg.outer.Add(p.pt);
					p = p.next;
				}
				while (i < this.m_PolyOuts.Count)
				{
					outRec = this.m_PolyOuts[i];
					if (outRec.pts == null || !outRec.isHole) break;
					Polygon pg = new Polygon();
					p = outRec.pts;
					do
					{
						pg.Add(p.pt);
						p = p.next;
					} while (p != outRec.pts);
					epg.holes.Add(pg);
					i++;
				}
				polyg.Add(epg);
			}
		}
		//------------------------------------------------------------------------------
*/
		private  fixupOutPolygon(outRec:OutRec):void
		{
			//FixupOutPolygon() - removes duplicate points and simplifies consecutive
			//parallel edges by removing the middle vertex.
			var lastOK:OutPt  = null;
			outRec.pts = outRec.bottomPt;
			var pp:OutPt = outRec.bottomPt;
			for (;;)
			{
				if (pp.prev == pp || pp.prev == pp.next)
				{
                    this.disposeOutPts(pp);
					outRec.pts = null;
					outRec.bottomPt = null;
					return;
				}
				//test for duplicate points and for same slope (cross-product) ...
				if (ClipperBase.pointsEqual(pp.pt, pp.next.pt) ||
				  this.slopesEqual3(pp.prev.pt, pp.pt, pp.next.pt, this.m_UseFullRange))
				{
					lastOK = null;
					var tmp:OutPt = pp;
					if (pp == outRec.bottomPt)
						 outRec.bottomPt = null; //flags need for updating
					pp.prev.next = pp.next;
					pp.next.prev = pp.prev;
					pp = pp.prev;
					tmp = null;
				}
				else if (pp == lastOK)
				{
					break;
				}
				else
				{
					if (lastOK == null) lastOK = pp;
					pp = pp.next;
				}
			}
			if (outRec.bottomPt == null) 
			{
				outRec.bottomPt = this.getBottomPt(pp);
				outRec.bottomPt.idx = outRec.idx;
				outRec.pts = outRec.bottomPt;
			}
		}
		//------------------------------------------------------------------------------

		private  checkHoleLinkages1(outRec1:OutRec, outRec2:OutRec):void
		{
		  //when a polygon is split into 2 polygons, make sure any holes the original
		  //polygon contained link to the correct polygon ...
		  for (var i:number = 0; i < this.m_PolyOuts.length; ++i)
		  {
			if (this.m_PolyOuts[i].isHole && this.m_PolyOuts[i].bottomPt != null &&
				this.m_PolyOuts[i].firstLeft == outRec1 &&
				!this.pointInPolygon(this.m_PolyOuts[i].bottomPt.pt, 
				outRec1.pts, this.m_UseFullRange))
					this.m_PolyOuts[i].firstLeft = outRec2;
		  }
		}
		//----------------------------------------------------------------------

		private  checkHoleLinkages2(outRec1:OutRec, outRec2:OutRec):void
		{
		  //if a hole is owned by outRec2 then make it owned by outRec1 ...
		  for (var i:number = 0; i < this.m_PolyOuts.length; ++i)
			if (this.m_PolyOuts[i].isHole && this.m_PolyOuts[i].bottomPt != null &&
			  this.m_PolyOuts[i].firstLeft == outRec2)
				this.m_PolyOuts[i].firstLeft = outRec1;
		}
		//----------------------------------------------------------------------

		private  joinCommonEdges(fixHoleLinkages:Boolean):void
		{
			for (var i:number = 0; i < this.m_Joins.length; i++)
			{
				var j:JoinRec = this.m_Joins[i];
				var outRec1:OutRec = this.m_PolyOuts[j.poly1Idx];
				var pp1aRef:OutPtRef = new OutPtRef(outRec1.pts);
				var outRec2:OutRec = this.m_PolyOuts[j.poly2Idx];
				var pp2aRef:OutPtRef = new OutPtRef(outRec2.pts);
				var seg1:Segment = new Segment(j.pt2a, j.pt2b);
				var seg2:Segment = new Segment(j.pt1a, j.pt1b);
				if (!this.findSegment(pp1aRef, seg1)) continue;
				if (j.poly1Idx == j.poly2Idx)
				{
					//we're searching the same polygon for overlapping segments so
					//segment 2 mustn't be the same as segment 1 ...
					pp2aRef.outPt = pp1aRef.outPt.next;
					if (!this.findSegment(pp2aRef, seg2) || (pp2aRef.outPt == pp1aRef.outPt)) continue;
				}
				else if (!this.findSegment(pp2aRef, seg2)) continue;

				var seg:Segment = new Segment(null, null);
				if (!this.getOverlapSegment(seg1, seg2, seg)) continue;
				
				var pt1:IntPoint = seg.pt1;
				var pt2:IntPoint = seg.pt2;
				var pt3:IntPoint = seg2.pt1;
				var pt4:IntPoint = seg2.pt2;

				var pp1a:OutPt = pp1aRef.outPt;
				var pp2a:OutPt = pp2aRef.outPt;
				
				var p1:OutPt, p2:OutPt, p3:OutPt, p4:OutPt;
				var prev:OutPt = pp1a.prev;
				//get p1 & p2 polypts - the overlap start & endpoints on poly1

				if (ClipperBase.pointsEqual(pp1a.pt, pt1)) p1 = pp1a;
				else if (ClipperBase.pointsEqual(prev.pt, pt1)) p1 = prev;
				else p1 = this.insertPolyPtBetween(pp1a, prev, pt1);

				if (ClipperBase.pointsEqual(pp1a.pt, pt2)) p2 = pp1a;
				else if (ClipperBase.pointsEqual(prev.pt, pt2)) p2 = prev;
				else if ((p1 == pp1a) || (p1 == prev))
					p2 = this.insertPolyPtBetween(pp1a, prev, pt2);
				else if (this.pt3IsBetweenPt1AndPt2(pp1a.pt, p1.pt, pt2))
					p2 = this.insertPolyPtBetween(pp1a, p1, pt2); 
				else
					p2 = this.insertPolyPtBetween(p1, prev, pt2);

				//get p3 & p4 polypts - the overlap start & endpoints on poly2
				prev = pp2a.prev;
				if (ClipperBase.pointsEqual(pp2a.pt, pt1)) p3 = pp2a;
				else if (ClipperBase.pointsEqual(prev.pt, pt1)) p3 = prev;
				else p3 = this.insertPolyPtBetween(pp2a, prev, pt1);

				if (ClipperBase.pointsEqual(pp2a.pt, pt2)) p4 = pp2a;
				else if (ClipperBase.pointsEqual(prev.pt, pt2)) p4 = prev;
				else if ((p3 == pp2a) || (p3 == prev))
					p4 = this.insertPolyPtBetween(pp2a, prev, pt2);
				else if (this.pt3IsBetweenPt1AndPt2(pp2a.pt, p3.pt, pt2))
					p4 = this.insertPolyPtBetween(pp2a, p3, pt2);
				else
					p4 = this.insertPolyPtBetween(p3, prev, pt2);

				//p1.pt should equal p3.pt and p2.pt should equal p4.pt here, so ...
				//join p1 to p3 and p2 to p4 ...
				if (p1.next == p2 && p3.prev == p4)
				{
					p1.next = p3;
					p3.prev = p1;
					p2.prev = p4;
					p4.next = p2;
				}
				else if (p1.prev == p2 && p3.next == p4)
				{
					p1.prev = p3;
					p3.next = p1;
					p2.next = p4;
					p4.prev = p2;
				}
				else
					continue; //an orientation is probably wrong

				if (j.poly2Idx == j.poly1Idx)
				{
					//instead of joining two polygons, we've just created a new one by
					//splitting one polygon into two.
					outRec1.pts = this.getBottomPt(p1);
					outRec1.bottomPt = outRec1.pts;
					outRec1.bottomPt.idx = outRec1.idx;
					outRec2 = this.createOutRec();
					this.m_PolyOuts.push(outRec2);
					outRec2.idx = this.m_PolyOuts.length - 1;
					j.poly2Idx = outRec2.idx;
					outRec2.pts = this.getBottomPt(p2);
					outRec2.bottomPt = outRec2.pts;
					outRec2.bottomPt.idx = outRec2.idx;

					if (this.pointInPolygon(outRec2.pts.pt, outRec1.pts, this.m_UseFullRange))
					{
						//outRec1 is contained by outRec2 ...
						outRec2.isHole = !outRec1.isHole;
						outRec2.firstLeft = outRec1;
						if (outRec2.isHole == Clipper.xor(this.m_ReverseOutput, this.orientationOutRec(outRec2, this.m_UseFullRange)))
                            this.reversePolyPtLinks(outRec2.pts);
					}
					else if (this.pointInPolygon(outRec1.pts.pt, outRec2.pts, this.m_UseFullRange))
					{
						//outRec2 is contained by outRec1 ...
						outRec2.isHole = outRec1.isHole;
						outRec1.isHole = !outRec2.isHole;
						outRec2.firstLeft = outRec1.firstLeft;
						outRec1.firstLeft = outRec2;
						if (outRec1.isHole == Clipper.xor(this.m_ReverseOutput, this.orientationOutRec(outRec1, this.m_UseFullRange)))
                            this.reversePolyPtLinks(outRec1.pts);
						//make sure any contained holes now link to the correct polygon ...
						if (fixHoleLinkages) this.checkHoleLinkages1(outRec1, outRec2);
					}
					else
					{
						outRec2.isHole = outRec1.isHole;
						outRec2.firstLeft = outRec1.firstLeft;
						//make sure any contained holes now link to the correct polygon ...
						if (fixHoleLinkages) this.checkHoleLinkages1(outRec1, outRec2);
					}

					//now fixup any subsequent this.m_Joins that match this polygon
					for (var k:number = i + 1; k < this.m_Joins.length; k++)
					{
						var j2:JoinRec = this.m_Joins[k];
						if (j2.poly1Idx == j.poly1Idx && this.pointIsVertex(j2.pt1a, p2))
							j2.poly1Idx = j.poly2Idx;
						if (j2.poly2Idx == j.poly1Idx && this.pointIsVertex(j2.pt2a, p2))
							j2.poly2Idx = j.poly2Idx;
					}
					
					//now cleanup redundant edges too ...
                    this.fixupOutPolygon(outRec1);
                    this.fixupOutPolygon(outRec2);
					if (this.orientationOutRec(outRec1, this.m_UseFullRange) != (this.areaOutRec(outRec1, this.m_UseFullRange) > 0))
                        this.disposeBottomPt(outRec1);
					if (this.orientationOutRec(outRec2, this.m_UseFullRange) != (this.areaOutRec(outRec2, this.m_UseFullRange) > 0))
                        this.disposeBottomPt(outRec2);
				}
				else
				{
					//joined 2 polygons together ...

					//make sure any holes contained by outRec2 now link to outRec1 ...
					if (fixHoleLinkages) this.checkHoleLinkages2(outRec1, outRec2);

					//now cleanup redundant edges too ...
                    this.fixupOutPolygon(outRec1);

					if (outRec1.pts != null)
					{
						outRec1.isHole = !this.orientationOutRec(outRec1, this.m_UseFullRange);
						if (outRec1.isHole &&  outRec1.firstLeft == null) 
						  outRec1.firstLeft = outRec2.firstLeft;
					}

					//delete the obsolete pointer ...
					var OKIdx:number = outRec1.idx;
					var ObsoleteIdx:number = outRec2.idx;
					outRec2.pts = null;
					outRec2.bottomPt = null;
					outRec2.appendLink = outRec1;

					//now fixup any subsequent joins that match this polygon
					for (k = i + 1; k < this.m_Joins.length; k++)
					{
						j2 = this.m_Joins[k];
						if (j2.poly1Idx == ObsoleteIdx) j2.poly1Idx = OKIdx;
						if (j2.poly2Idx == ObsoleteIdx) j2.poly2Idx = OKIdx;
					}
				}
			}
		}

		private  areaOutRec(outRec:OutRec, useFull64BitRange:Boolean):number
		{
			var op:OutPt = outRec.pts;

				var a:number = 0;
				do {
				  a += (op.prev.pt.X * op.pt.Y) - (op.pt.X * op.prev.pt.Y);
				  op = op.next;
				} while (op != outRec.pts);
				return a/2;

		}

    }

    export class Protects
    {
        public static  NONE:number = 0;
        public static  LEFT:number = 1;
        public static  RIGHT:number = 2;
        public static  BOTH:number = 3;
    }

    export class Direction
    {
        public static  RIGHT_TO_LEFT:number = 0;
        public static  LEFT_TO_RIGHT:number = 1;
    }

    export class Scanbeam
    {
        public  Y:number;
        public  next:Scanbeam;
    }


}








