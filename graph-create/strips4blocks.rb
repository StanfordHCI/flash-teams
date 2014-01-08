#! /bin/ruby

def printElem(elem)
	puts("\nName: #{elem["name"]}")
	puts("Input: #{elem["input"]}")
	puts("Output: #{elem["output"]}")
	puts("Descr: #{elem["description"]}")
	puts("========\n")
end

def printSTRIPS(content)
	puts("Initial State: ")
	puts("Goal State: ")
	puts("Actions: ")


	# Write the content out
	puts(content)

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
	line = line.gsub(/[^a-zA-Z\^\- \t]/,"")
	#line = line.gsub("]","")
	lineAry = line.split("\t")

	toAdd["idx"] = lineIdx
	# Get the action name
	toAdd["name"] = lineAry[0].gsub(" ","_")
	# Get the preconditions
	toAdd["input"] = lineAry[2].split(/[ v ][ ^ ]/)
	toAdd["input"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the postconditions
	toAdd["output"] = lineAry[3].split(/[ v ][ ^ ]/)
	toAdd["output"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the action description
	toAdd["description"] = "#{lineAry[5]} (performed by #{lineAry[4]})"
#puts("Descr: #{lineAry[4]}")

	blockArray << toAdd
}

#puts(blockArray)

blockArray.each{ |elem|
	gContent = "#{gContent}
	// Action ##{elem["idx"]}: #{elem["description"]}
	_#{elem["name"]}_
	Preconditions: #{elem["input"].join(", ")}
	Preconditions: #{elem["input"].join(", ")}\n"
}

printSTRIPS(gContent)

#puts("Done.")
