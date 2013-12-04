#! /bin/ruby

isLite = false;

# Color set -- MUST be at least as large as the number of possible tasks
colorArray = ["darkgoldenrod2", "cornflowerblue", "gray45", "deeppink", "darkolivegreen", "darksalmon", "darkorchid", "burlywood"];

if( ARGV[1] != nil && ARGV[1].downcase == "lite" )
	isLite = true;
end

def printElem(elem)
	$stderr.puts("\nName: #{elem["name"]}")
	$stderr.puts("Input: #{elem["input"].join("; ")}")
	$stderr.puts("Output: #{elem["output"].join("; ")}")
	$stderr.puts("Descr: #{elem["description"]}")
	$stderr.puts("Tasks: #{elem["tasktags"].join("-")}")
	$stderr.puts("========\n")
end

def printGraph(content)
	puts('digraph graph_example {

 /***** GLOBAL SETTINGS *****/

 graph          [rotate=0, rankdir="LR"]
 node           [color="#222222", style=filled,
                 shape=box, fontname="Trebuchet MS"]
 edge           [color="#66FF66", arrowhead="open", 
                 fontname="Trebuchet MS", fontsize="11"]
 node           [fillcolor="#253987", fontcolor="white"]

/***** LINKS *****/

')


	# Write the content out
	puts(content)

	puts("}")
end


#########################

file = File.open(ARGV[0])
blockArray = Array.new
gContent = ""
gLinks = ""

lineIdx = -1
file.each{ |line|
	lineIdx += 1
	if( lineIdx == 0 )
		next
	end

	toAdd = Hash.new

	#line = line.gsub(/[^a-zA-Z0-9⋁⋀\- \t]/,"")
	line = line.gsub(/[^a-zA-Z0-9;,\/\\\- \t]/,"")
	#line = line.gsub("]","")
	lineAry = line.split("\t")

	# Get the action name
	toAdd["name"] = lineAry[0].gsub(" ","_")
	# Get the preconditions
	#toAdd["input"] = lineAry[2].split(/[ ^ ]/)
	#toAdd["input"] = lineAry[2].split(/[ v ][ ^ ]/)
	#toAdd["input"] = lineAry[2].split(/[\s*⋀\s*][\s*⋁\s*]/)
	toAdd["input"] = lineAry[2].split(/\s*;\s*/)
	toAdd["input"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the postconditions
	#toAdd["output"] = lineAry[3].split(/[ ^ ]/)
	#toAdd["output"] = lineAry[3].split(/[ v ][ ^ ]/)
	#toAdd["output"] = lineAry[3].split(/[\s*⋀\s*][\s*⋁\s*]/)
	toAdd["output"] = lineAry[3].split(/\s*;\s*/)
	toAdd["output"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the action description
	toAdd["description"] = "#{lineAry[4]}: #{lineAry[5]}"

	numTasks = lineAry.length > 8 ? lineAry.length - 8 : 0
	taskAry = Array.new
	for i in 9..lineAry.length
		#puts("task val: #{lineAry[i]}");
		taskAry << lineAry[i]
	end
	toAdd["tasktags"] = taskAry

	printElem(toAdd)

	blockArray << toAdd
}

#puts(blockArray)

blockArray.each{ |elem|
        if( !isLite )
		gContent = "#{gContent}pre#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["input"].join("; ")}\", fillcolor=red]\n"
		gContent = "#{gContent}post#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["output"].join("; ")}\", fillcolor=grey]\n"
	end
	
	# Get the color for the node based on the task marked
	selColor = "black"  # Set a default color
	for i in 0...elem["tasktags"].length
		if( elem["tasktags"][i] == "1" )
			selColor = colorArray[i]
			break
		end
	end
	gContent = "#{gContent}#{elem["name"]}	[label=\"<B>[ #{elem["name"]} ]</B>\n#{elem["description"]}\", fillcolor=#{selColor}]\n"
}

# Add the basic links between sets of task components (only needed if using the ternary representaion)
if( !isLite )
	blockArray.each{ |elem|
	        gContent = "#{gContent}pre#{elem["name"]}->#{elem["name"]}       [label=\"\", color=black]\n"
	        gContent = "#{gContent}#{elem["name"]}->post#{elem["name"]}       [label=\"\", color=black]\n"
	}
end

# Add I/O links
blockArray.each{ |elem|
	elem["output"].each{ |outE|
		blockArray.each{ |innerElem|
			innerElem["input"].each{ |inE|
				#content += "#{elem["name"])}    [label=\"#{elem["description"]}\"]\n"
				if( outE == inE )
					if( !isLite )
						gLinks = "#{gLinks}post#{elem["name"]}->pre#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
					else
						gLinks = "#{gLinks}#{elem["name"]}->#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
					end
				end
			}
		}
	}
}

printGraph(gContent + gLinks)

#puts("Done.")
